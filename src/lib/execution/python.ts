import { execute } from "src/services/pythonService";

export const executePython = async (code: string) => {
    try {
        const executeResult = await execute(code);
        console.log('Python execution result:', executeResult);
        return executeResult;
    } catch (error) {
        console.error('Python execution error:', error);
        throw error;
    }
}; 