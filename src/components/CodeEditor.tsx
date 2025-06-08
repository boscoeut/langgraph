import { useState, useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

interface CodeEditorProps {
    language: string;
    value: string;
    onChange: (value: string) => void;
    onExecute: (code: string) => Promise<void>;
}

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

export function CodeEditor({ language, value, onChange, onExecute }: CodeEditorProps) {
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
            onChange(value);
        }
    };

    const handleExecute = async () => {
        setIsExecuting(true);
        try {
            await onExecute(value);
        } finally {
            setIsExecuting(false);
        }
    };

    return (
        <div className="flex-1 h-[calc(100vh-400px)]">
            <div className="mb-4">
                <button
                    onClick={handleExecute}
                    disabled={isExecuting}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isExecuting ? "Executing..." : "Execute"}
                </button>
            </div>
            <Editor
                height="100%"
                defaultLanguage={language}
                language={language}
                value={value}
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
    );
} 