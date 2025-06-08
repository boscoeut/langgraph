export const executePython = async (code: string) => {
    try {
        // For Python, we'll need to send the code to a backend service
        // This is a placeholder for the actual implementation
        const response = await fetch('/api/execute-python', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
        });

        if (!response.ok) {
            throw new Error('Failed to execute Python code');
        }

        const result = await response.json();
        return result.output;
    } catch (error) {
        return [`Error: ${error instanceof Error ? error.message : String(error)}`];
    }
}; 