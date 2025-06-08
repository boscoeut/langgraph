import { Combobox } from "react-widgets";
import "react-widgets/styles.css";
import { useState } from "react";

interface AgentEditorProps {
    selectedAgent: string;
}

const programmingLanguages = [
    { id: "typescript", name: "TypeScript" },
    { id: "python", name: "Python" }
];

export function AgentEditor({ selectedAgent }: AgentEditorProps) {
    const [selectedLanguage, setSelectedLanguage] = useState("typescript");
    const [code, setCode] = useState("");

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 p-4 border-l">
                <div className="mb-6">
                    <Combobox
                        data={programmingLanguages}
                        dataKey="id"
                        textField="name"
                        value={selectedLanguage}
                        onChange={(value) => setSelectedLanguage(typeof value === 'string' ? value : value.id)}
                        className="w-48"
                    />
                </div>
                <div className="flex-1 h-[calc(100vh-300px)]">
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full h-full p-4 font-mono text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={selectedLanguage === "typescript" ? "// TypeScript code here" : "# Python code here"}
                    />
                </div>
            </div>
        </div>
    );
} 