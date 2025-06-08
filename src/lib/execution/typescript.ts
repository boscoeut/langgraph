// Helper function to capture console output
const captureConsoleOutput = () => {
    const originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info
    };

    const output: string[] = [];

    console.log = (...args) => {
        output.push(args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
        originalConsole.log.apply(console, args);
    };

    console.error = (...args) => {
        output.push(`Error: ${args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ')}`);
        originalConsole.error.apply(console, args);
    };

    console.warn = (...args) => {
        output.push(`Warning: ${args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ')}`);
        originalConsole.warn.apply(console, args);
    };

    console.info = (...args) => {
        output.push(`Info: ${args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ')}`);
        originalConsole.info.apply(console, args);
    };

    return {
        getOutput: () => output,
        restore: () => {
            console.log = originalConsole.log;
            console.error = originalConsole.error;
            console.warn = originalConsole.warn;
            console.info = originalConsole.info;
        }
    };
};

export const executeTypeScript = async (code: string) => {
    const consoleCapture = captureConsoleOutput();
    try {
        // Create a safe execution environment
        const safeEval = new Function('console', `
            try {
                ${code}
            } catch (error) {
                console.error(error);
            }
        `);
        
        safeEval(console);
        return consoleCapture.getOutput();
    } catch (error) {
        return [`Error: ${error instanceof Error ? error.message : String(error)}`];
    } finally {
        consoleCapture.restore();
    }
}; 