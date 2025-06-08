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
import textwrap

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
MEMORY_LIMIT = 2 * 1024 * 1024  # 2MB
CPU_TIME_LIMIT = 5  # 5 seconds
WRITE_LIMIT = 1024 * 1024  # 1MB

# Restricted modules that cannot be imported
RESTRICTED_MODULES = {
    'os', 'subprocess', 'multiprocessing', 'threading',
    'socket', 'ftplib', 'http', 'urllib', 'smtplib', 'telnetlib',
    'popen2', 'commands', 'pty', 'fcntl', 'termios', 'tty', 'pwd',
    'grp', 'crypt', 'curses', 'readline', 'rlcompleter', 'dbm',
    'gdbm', 'dbhash', 'bsddb', 'dumbdbm', 'anydbm', 'whichdb',
    'zlib', 'bz2', 'zipfile', 'tarfile', 'shutil', 'glob', 'fnmatch',
    'linecache', 'shlex', 'macpath', 'stat', 'statcache', 'pickle',
    'cPickle', 'marshal', 'warnings', 'getopt', 'optparse', 'imp',
    'tokenize', 'parser', 'symbol', 'token', 'keyword', 'pyclbr',
    'code', 'codeop', 'pdb', 'pydoc', 'doctest', 'unittest', 'test',
    'test.test_support', 'platform', 'ctypes', 'msvcrt', 'winreg',
    'winsound', 'win32api', 'win32con', 'win32evtlog', 'win32evtlogutil',
    'win32file', 'win32pipe', 'win32process', 'win32security', 'win32service',
    'win32serviceutil', 'win32trace', 'win32transaction', 'win32ts',
    'pythoncom', 'pywintypes', 'pythonwin', 'mmapfile', 'win32com',
    'win32com.client', 'win32com.server', 'win32com.server.util',
    'win32com.server.policy', 'win32com.server.exception', 'win32com.server.misc',
    'win32com.server.connect', 'win32com.server.dispatcher', 'win32com.server.util',
    'win32com.server.policy', 'win32com.server.exception', 'win32com.server.misc',
    'win32com.server.connect', 'win32com.server.dispatcher'
}

class CodeExecutionRequest(BaseModel):
    code: str
    timeout: int = 5

def set_resource_limits():
    """Set resource limits for the sandboxed process."""
    soft, hard = resource.getrlimit(resource.RLIMIT_AS)
    print("Current soft limit:", soft)
    print("Current hard limit:", hard)
    resource.setrlimit(resource.RLIMIT_CPU, (CPU_TIME_LIMIT, CPU_TIME_LIMIT))
    resource.setrlimit(resource.RLIMIT_FSIZE, (WRITE_LIMIT, WRITE_LIMIT))

def create_sandbox_script(code: str) -> str:
    """Create a temporary Python script with the sandboxed code."""
    # Add import restrictions
    restricted_imports = textwrap.dedent(f"""
        # Restricted imports
        restricted_modules = {RESTRICTED_MODULES}
        
        def check_imports():
            import sys
            for module_name in sys.modules:
                if module_name in restricted_modules:
                    raise ImportError("Import of " + module_name + " is not allowed")
        
        # Check existing imports
        check_imports()
        
        # Monitor future imports
        import builtins
        original_import = builtins.__import__
        
        def restricted_import(name, *args, **kwargs):
            if name in restricted_modules:
                raise ImportError("Import of " + name + " is not allowed")
            return original_import(name, *args, **kwargs)
        
        builtins.__import__ = restricted_import
    """)
    
    # Combine the restrictions with the user's code
    script = f"{restricted_imports}\n\n{code}"
    return script

@app.post("/execute")
async def execute_code(request: CodeExecutionRequest) -> Dict[str, Any]:
    """Execute Python code in a sandboxed environment."""
    try:
        # Create a temporary file for the sandboxed code
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(create_sandbox_script(request.code))
            # f.write(request.code)
            temp_file = f.name

        # Create a clean environment for the subprocess
        env = os.environ.copy()
        # Remove potentially dangerous environment variables
        for key in ['PYTHONPATH', 'PYTHONHOME', 'PYTHONSTARTUP']:
            env.pop(key, None)

        # Execute the code in a subprocess with resource limits
        process = subprocess.Popen(
            [sys.executable, temp_file],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            env=env,
            preexec_fn=set_resource_limits  # Set resource limits before execution
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