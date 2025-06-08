import { Combobox } from "react-widgets";
import "react-widgets/styles.css";

interface AgentSelectorProps {
  onAgentChange: (agent: string) => void;
  selectedAgent: string;
}

const availableAgents = [
  { id: "chatAgent", name: "Chat Agent" },
  { id: "baseAgent", name: "Base Agent" }
];

export function AgentSelector({ onAgentChange, selectedAgent }: AgentSelectorProps) {
  return (
    <div className="w-48">
      <Combobox
        data={availableAgents}
        dataKey="id"
        textField="name"
        value={selectedAgent}
        onChange={(value) => onAgentChange(typeof value === 'string' ? value : value.id)}
        placeholder="Select an agent"
      />
    </div>
  );
} 