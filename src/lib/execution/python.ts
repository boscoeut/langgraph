import { executePythonCode } from "src/services/pythonSandboxService";

export const executePython = async (code: string) => {
    try {
        const executeResult = await executePythonCode(code);
        console.log('Python execution result:', executeResult);
        return executeResult;
    } catch (error) {
        console.error('Python execution error:', error);
        throw error;
    }
}; 