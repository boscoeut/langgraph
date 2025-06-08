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
    // await pyodide.loadPackage('numpy');
    let capturedOutput = '';
    
    pyodide.setStdout((msg: any) => {
      capturedOutput += msg + '\n';
    });
    pyodide.setStderr((msg: any) => {
      capturedOutput += msg + '\n';
    });
    const result = await pyodide.runPythonAsync(code);
    console.log('Python execution output:', capturedOutput);
    console.log('Python execution result:', result);
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