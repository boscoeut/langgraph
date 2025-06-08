interface SandboxResponse {
  stdout: string;
  stderr: string;
  exit_code: number;
}

const SANDBOX_API_URL = 'http://localhost:8000';

export async function executePythonCode(code: string, timeout: number = 5): Promise<SandboxResponse> {
  try {
    const response = await fetch(`${SANDBOX_API_URL}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        timeout,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to execute Python code');
    }

    return await response.json();
  } catch (error) {
    console.error('Error executing Python code:', error);
    throw error;
  }
} 