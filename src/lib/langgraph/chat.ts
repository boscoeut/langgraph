import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { PollinationsLLM } from "./llm";
import { StateGraph, END } from "@langchain/langgraph";

// Define the state interface
interface ChatState {
  messages: string[];
  currentMessage: string;
}

// Create the LLM instance
const model = new PollinationsLLM();

// Create the prompt template
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful AI assistant."],
  ["human", "{input}"],
]);

// Create the chain
const chain = RunnableSequence.from([
  prompt,
  model,
  new StringOutputParser(),
]);

// Define the nodes
const processMessage = async (state: ChatState) => {
  const result = await chain.invoke({ input: state.currentMessage });
  return {
    messages: [...state.messages, state.currentMessage, result],
    currentMessage: "",
  };
};

// Create the graph
const workflow = new StateGraph<ChatState>({
  channels: {
    messages: { value: [] },
    currentMessage: { value: "" },
  },
});

// Add nodes
workflow.addNode("process", processMessage);

// Add edges
workflow.addEdge("process", END);

// Set the entry point
workflow.setEntryPoint("process");

// Compile the graph
const app = workflow.compile();

// Create a function to process messages using the graph
export async function processChatMessage(message: string) {
  try {
    const result = await app.invoke({
      messages: [],
      currentMessage: message,
    });
    return result.messages;
  } catch (error) {
    console.error("Error processing message:", error);
    throw error;
  }
}
