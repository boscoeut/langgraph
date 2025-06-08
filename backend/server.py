import os
import sys
import resource
import subprocess
import tempfile
from typing import Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Resource limits
MEMORY_LIMIT = 512 * 1024 * 1024  # 512MB
CPU_TIME_LIMIT = 5  # 5 seconds
WRITE_LIMIT = 1024 * 1024  # 1MB

class CodeExecutionRequest(BaseModel):
    code: str
    timeout: int = 5

def set_resource_limits():
    """Set resource limits for the sandboxed process."""
    soft, hard = resource.getrlimit(resource.RLIMIT_AS)
    print("Current soft limit:", soft)
    print("Current hard limit:", hard)
    new_limit = min(536870912, hard)  # 512MB or the current hard limit
    resource.setrlimit(resource.RLIMIT_AS, (new_limit, hard))
    resource.setrlimit(resource.RLIMIT_CPU, (CPU_TIME_LIMIT, CPU_TIME_LIMIT))
    resource.setrlimit(resource.RLIMIT_FSIZE, (WRITE_LIMIT, WRITE_LIMIT))

def create_sandbox_script(code: str) -> str:
    """Create a temporary Python script with the sandboxed code."""
    script = f"""
import sys
import resource
import traceback

def set_limits():
    resource.setrlimit(resource.RLIMIT_AS, ({MEMORY_LIMIT}, {MEMORY_LIMIT}))
    resource.setrlimit(resource.RLIMIT_CPU, ({CPU_TIME_LIMIT}, {CPU_TIME_LIMIT}))
    resource.setrlimit(resource.RLIMIT_FSIZE, ({WRITE_LIMIT}, {WRITE_LIMIT}))

try:
    {code}
except Exception as e:
    print(f"Error: {{str(e)}}", file=sys.stderr)
    traceback.print_exc(file=sys.stderr)
"""
    return script

@app.post("/execute")
async def execute_code(request: CodeExecutionRequest) -> Dict[str, Any]:
    """Execute Python code in a sandboxed environment."""
    try:
        # Create a temporary file for the sandboxed code
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(create_sandbox_script(request.code))
            temp_file = f.name

        # Execute the code in a subprocess with resource limits
        process = subprocess.Popen(
            [sys.executable, temp_file],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        try:
            stdout, stderr = process.communicate(timeout=request.timeout)
        except subprocess.TimeoutExpired:
            process.kill()
            raise HTTPException(status_code=408, detail="Code execution timed out")

        # Clean up the temporary file
        os.unlink(temp_file)

        return {
            "stdout": stdout,
            "stderr": stderr,
            "exit_code": process.returncode
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 