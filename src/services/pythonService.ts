import { loadPyodide } from 'pyodide';

let pyodideInstance: any = null;

export async function initializePython() {
  if (!pyodideInstance) {
    pyodideInstance = await loadPyodide({
      indexURL: "/pyodide"
    });
  }
  return pyodideInstance;
}

export async function execute(code: string): Promise<string> {
  try {
    const pyodide = await initializePython();
    let capturedOutput = '';
    
    // Set up stdout handler using batched mode
    pyodide.setStdout({
      batched: (msg: string) => {
        console.log('Python stdout:', msg);
        capturedOutput += msg + '\n';
      }
    });

    // Set up stderr handler using batched mode
    pyodide.setStderr({
      batched: (msg: string) => {
        console.error('Python stderr:', msg);
        capturedOutput += msg + '\n';
      }
    });

    // Run the Python code
    const result = await pyodide.runPythonAsync(code);
    
    // If there's a return value, add it to the output
    if (result !== undefined) {
      capturedOutput += String(result);
    }

    console.log('Python execution output:', capturedOutput);
    return capturedOutput;
  } catch (error) {
    console.error('Python execution error:', error);
    throw error;
  }
}

export async function installPackage(packageName: string) {
  const pyodide = await initializePython();
  await pyodide.loadPackage(packageName);
}

// Test function to verify Python output capture
export async function testPythonOutput(): Promise<string> {
  const testCode = `
def greet():
    print("Hello from Python!")
    return "Greeting completed"

greet()
`;
  return execute(testCode);
} 