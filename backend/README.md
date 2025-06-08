# Python Code Sandbox Server

This is a secure backend server that executes Python code in a sandboxed environment. It provides resource limits and process isolation to safely run untrusted code.

## Features

- Resource limits:
  - Memory: 512MB
  - CPU time: 5 seconds
  - File size: 1MB
- Process isolation
- Timeout protection
- Error handling and reporting

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
python server.py
```

The server will start on `http://localhost:8000`.

## API Usage

### Execute Code

**Endpoint:** `POST /execute`

**Request Body:**
```json
{
    "code": "print('Hello, World!')",
    "timeout": 5  // optional, defaults to 5 seconds
}
```

**Response:**
```json
{
    "stdout": "Hello, World!\n",
    "stderr": "",
    "exit_code": 0
}
```

## Testing

Run the test script to verify the sandbox functionality:
```bash
python test_sandbox.py
```

## Security Considerations

- The sandbox uses process isolation and resource limits
- Each code execution runs in a separate process
- System access is restricted
- Memory and CPU usage are limited
- Timeouts prevent infinite loops

## Limitations

- No network access
- No file system access (except temporary files)
- Limited memory and CPU resources
- No access to system commands 