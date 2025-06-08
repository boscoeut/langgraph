import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { PollinationsLLM } from "./llm";

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

// Create a function to process messages using the chain
export async function processMessage(message: string) {
  try {
    const result = await chain.invoke({ input: message });
    return result;
  } catch (error) {
    console.error("Error processing message:", error);
    throw error;
  }
}
