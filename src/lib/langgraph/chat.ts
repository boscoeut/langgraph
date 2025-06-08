import { END, START, StateGraph } from "@langchain/langgraph/web";
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
  })),
  searchResult: z.string()
});

// Define the chat node with error handling
const chatNode = async (state: z.infer<typeof stateSchema>) => {
  try {
    const baseUrl = "https://text.pollinations.ai";
    const response = await fetch(`${baseUrl}/${encodeURIComponent(state.currentMessage)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.text();
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

const generatePromptNode = async (state: z.infer<typeof stateSchema>) => {

  const prompt = `
  You are a helpful assistant that can answer questions and help with tasks.
  You are given a search result and a user query.
  Answer the user query based on the search result.

  Search Result: ${state.searchResult}
  User Query: ${state.currentMessage}

  Answer:
  `;

  return {
    messages: state.messages,
    currentMessage: prompt,
    searchResult: state.searchResult,
    errors: state.errors
  };
};

const addSearchNode = async (state: z.infer<typeof stateSchema>) => {
  try {
    const baseUrl = "https://text.pollinations.ai";
    const query = "List 10 colors";
    const response = await fetch(`${baseUrl}/${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.text();
    return {
      messages: state.messages,
      currentMessage: state.currentMessage,
      searchResult: result,
      errors: state.errors
    };
  } catch (error) {
    return {
      messages: state.messages,
      currentMessage: state.currentMessage,
      searchResult: "",
      errors: [...state.errors, {
        type: "SEARCH_ERROR",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      }]
    };
  }
};

// Create the graph
const workflow = new StateGraph(stateSchema)
  .addNode("chat", chatNode)
  .addNode("search", addSearchNode)
  .addNode("generatePrompt", generatePromptNode)
  .addEdge(START, "search")
  .addEdge("search", "generatePrompt")
  .addEdge("generatePrompt", "chat")
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
