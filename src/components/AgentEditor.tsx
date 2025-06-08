import { Combobox } from "react-widgets";
import "react-widgets/styles.css";
import { useState, useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

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

export function AgentEditor({ selectedAgent }: AgentEditorProps) {
    const [selectedLanguage, setSelectedLanguage] = useState("typescript");
    const [code, setCode] = useState("");
    const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
    const [isExecuting, setIsExecuting] = useState(false);
    const monaco = useMonaco();

    useEffect(() => {
        if (monaco) {
            // Register TypeScript snippets
            monaco.languages.registerCompletionItemProvider("typescript", {
                provideCompletionItems: (model, position) => {
                    const word = model.getWordUntilPosition(position);
                    const range = {
                        startLineNumber: position.lineNumber,
                        endLineNumber: position.lineNumber,
                        startColumn: word.startColumn,
                        endColumn: word.endColumn
                    };

                    return {
                        suggestions: typescriptSnippets.map(snippet => ({
                            label: snippet.label,
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: snippet.insertText,
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: snippet.documentation,
                            range
                        }))
                    };
                }
            });

            // Register Python snippets
            monaco.languages.registerCompletionItemProvider("python", {
                provideCompletionItems: (model, position) => {
                    const word = model.getWordUntilPosition(position);
                    const range = {
                        startLineNumber: position.lineNumber,
                        endLineNumber: position.lineNumber,
                        startColumn: word.startColumn,
                        endColumn: word.endColumn
                    };

                    return {
                        suggestions: pythonSnippets.map(snippet => ({
                            label: snippet.label,
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: snippet.insertText,
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: snippet.documentation,
                            range
                        }))
                    };
                }
            });
        }
    }, [monaco]);

    const handleEditorChange = (value: string | undefined) => {
        if (value !== undefined) {
            setCode(value);
        }
    };

    const handleExecute = async () => {
        setIsExecuting(true);
        setConsoleOutput(prev => [...prev, `> Executing ${selectedLanguage} code...`]);
        
        try {
            // TODO: Implement actual code execution
            // For now, just simulate execution
            await new Promise(resolve => setTimeout(resolve, 1000));
            setConsoleOutput(prev => [...prev, "Code executed successfully"]);
        } catch (error) {
            setConsoleOutput(prev => [...prev, `Error: ${error instanceof Error ? error.message : String(error)}`]);
        } finally {
            setIsExecuting(false);
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
                    <button
                        onClick={handleExecute}
                        disabled={isExecuting}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isExecuting ? "Executing..." : "Execute"}
                    </button>
                </div>
                <div className="flex-1 h-[calc(100vh-400px)]">
                    <Editor
                        height="100%"
                        defaultLanguage={selectedLanguage}
                        language={selectedLanguage}
                        value={code}
                        onChange={handleEditorChange}
                        theme="vs-dark"
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            lineNumbers: "on",
                            roundedSelection: false,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            tabSize: 2,
                            wordWrap: "on",
                            suggestOnTriggerCharacters: true,
                            quickSuggestions: true,
                            acceptSuggestionOnEnter: "on"
                        }}
                    />
                </div>
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