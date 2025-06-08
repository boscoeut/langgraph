import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { PollinationsLLM } from "./llm";
import { StateGraph, END, START, Annotation } from "@langchain/langgraph/web";
import { z } from "zod";

// Define the state schema using Zod
const stateSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string()
  })),
  currentMessage: z.string(),
  errors: z.array(z.object({
    type: z.string(),
    message: z.string()
  }))
});

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

// Define the chat node with error handling
const chatNode = async (state: z.infer<typeof stateSchema>) => {
  try {
    const result = await chain.invoke({ input: state.currentMessage });
    return {
      messages: [...state.messages, 
        { role: "user", content: state.currentMessage },
        { role: "assistant", content: result }
      ],
      currentMessage: "",
      errors: state.errors
    };
  } catch (error) {
    return {
      messages: state.messages,
      currentMessage: state.currentMessage,
      errors: [...state.errors, {
        type: "CHAT_ERROR",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      }]
    };
  }
};

// Create the graph
const workflow = new StateGraph(stateSchema)
  .addNode("chat", chatNode)
  .addEdge(START, "chat")
  .addEdge("chat", END)
  .compile();

// Create a function to process messages using the graph
export async function processMessage(message: string) {
  try {
    const result = await workflow.invoke({
      messages: [],
      currentMessage: message,
      errors: []
    });
    console.log(result);
    return result.messages;
  } catch (error) {
    console.error("Error processing message:", error);
    throw error;
  }
}
