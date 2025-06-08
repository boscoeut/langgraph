import { Combobox } from "react-widgets";
import "react-widgets/styles.css";
import { useState } from "react";
import { CodeEditor } from "./CodeEditor";
import { executeTypeScript } from "../lib/execution/typescript";
import { executePython } from "../lib/execution/python";

interface AgentEditorProps {
    selectedAgent: string;
}

const programmingLanguages = [
    { id: "typescript", name: "TypeScript" },
    { id: "python", name: "Python" }
];

// TypeScript snippets
const typescriptSnippets = [
    {
        label: "function",
        insertText: "function ${1:name}(${2:params}): ${3:returnType} {\n\t${0}\n}",
        documentation: "Function declaration"
    },
    {
        label: "arrow",
        insertText: "const ${1:name} = (${2:params}): ${3:returnType} => {\n\t${0}\n}",
        documentation: "Arrow function"
    },
    {
        label: "interface",
        insertText: "interface ${1:name} {\n\t${0}\n}",
        documentation: "Interface declaration"
    },
    {
        label: "class",
        insertText: "class ${1:name} {\n\tconstructor(${2:params}) {\n\t\t${0}\n\t}\n}",
        documentation: "Class declaration"
    }
];

// Python snippets
const pythonSnippets = [
    {
        label: "def",
        insertText: "def ${1:name}(${2:params}):\n\t${0}",
        documentation: "Function definition"
    },
    {
        label: "class",
        insertText: "class ${1:name}:\n\tdef __init__(self${2:, params}):\n\t\t${0}",
        documentation: "Class definition"
    },
    {
        label: "if",
        insertText: "if ${1:condition}:\n\t${0}",
        documentation: "If statement"
    },
    {
        label: "for",
        insertText: "for ${1:item} in ${2:items}:\n\t${0}",
        documentation: "For loop"
    }
];

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

export function AgentEditor({ selectedAgent }: AgentEditorProps) {
    const [selectedLanguage, setSelectedLanguage] = useState("typescript");
    const [code, setCode] = useState("");
    const [consoleOutput, setConsoleOutput] = useState<string[]>([]);

    const handleExecute = async (code: string) => {
        setConsoleOutput(prev => [...prev, `> Executing ${selectedLanguage} code...`]);
        
        try {
            const output:any = selectedLanguage === 'typescript' 
                ? await executeTypeScript(code)
                : await executePython(code);
            // how to tell if the output is a string or an array?
            if (typeof output === 'string') {
                setConsoleOutput(prev => [...prev, output]);
            } else if (output.stdout) {
                setConsoleOutput(prev => [...prev, output.stdout]);
            } else if (output.stderr) {
                setConsoleOutput(prev => [...prev, output.stderr]);
            } else {
                setConsoleOutput(prev => [...prev, ...output]);
            }
        } catch (error) {
            setConsoleOutput(prev => [...prev, `Error: ${error instanceof Error ? error.message : String(error)}`]);
        }
    };

    const clearConsole = () => {
        setConsoleOutput([]);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 p-4 border-l">
                <div className="mb-6 flex items-center gap-4">
                    <Combobox
                        data={programmingLanguages}
                        dataKey="id"
                        textField="name"
                        value={selectedLanguage}
                        onChange={(value) => setSelectedLanguage(typeof value === 'string' ? value : value.id)}
                        className="w-48"
                    />
                </div>
                <CodeEditor
                    language={selectedLanguage}
                    value={code}
                    onChange={setCode}
                    onExecute={handleExecute}
                />
                <div className="mt-4 h-[200px] bg-gray-900 rounded-lg overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
                        <h3 className="text-sm font-medium text-gray-200">Console</h3>
                        <button
                            onClick={clearConsole}
                            className="text-gray-400 hover:text-gray-200 text-sm"
                        >
                            Clear
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 font-mono text-sm text-gray-200">
                        {consoleOutput.map((line, index) => (
                            <div key={index} className="whitespace-pre-wrap">
                                {line}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
} 