import { END, START, StateGraph } from "@langchain/langgraph/web";
import { z } from "zod";

// Define the enhanced state schema using Zod
const stateSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string()
  })),
  currentMessage: z.string(),
  originalQuery: z.string(),
  queryVariations: z.array(z.string()),
  queryResponses: z.array(z.object({
    query: z.string(),
    response: z.string()
  })),
  bestResponse: z.string(),
  errors: z.array(z.object({
    type: z.string(),
    message: z.string()
  }))
});

// Helper function to call text.pollinations.ai
const callPollinationsAI = async (prompt: string): Promise<string> => {
  const baseUrl = "https://text.pollinations.ai";
  const response = await fetch(`${baseUrl}/${encodeURIComponent(prompt)}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.text();
};

// Node to generate 5 query variations
const generateVariationsNode = async (state: z.infer<typeof stateSchema>) => {
  try {
    const prompt = `Given this user query: "${state.originalQuery}"

Generate 5 different ways to ask this question that might get better or more comprehensive answers. Each variation should approach the question from a different angle or with different emphasis.

Format your response as a numbered list (1. 2. 3. 4. 5.) with each variation on a new line. Only output the 5 variations, nothing else.`;

    const result = await callPollinationsAI(prompt);
    
    // Parse the variations from the numbered list
    const variations = result
      .split('\n')
      .filter(line => line.trim().match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(v => v.length > 0)
      .slice(0, 5);

    // If we didn't get 5 variations, use the original query to fill
    while (variations.length < 5) {
      variations.push(state.originalQuery);
    }

    return {
      ...state,
      queryVariations: variations
    };
  } catch (error) {
    return {
      ...state,
      queryVariations: [state.originalQuery], // Fallback to original query
      errors: [...state.errors, {
        type: "VARIATION_ERROR",
        message: error instanceof Error ? error.message : "Failed to generate variations"
      }]
    };
  }
};

// Node to run all 5 queries in parallel
const runParallelQueriesNode = async (state: z.infer<typeof stateSchema>) => {
  try {
    // Create promises for all queries
    const queryPromises = state.queryVariations.map(async (query: string) => {
      try {
        const response = await callPollinationsAI(query);
        return { query, response };
      } catch (error) {
        return { 
          query, 
          response: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}` 
        };
      }
    });

    // Wait for all queries to complete
    const responses = await Promise.all(queryPromises);

    return {
      ...state,
      queryResponses: responses
    };
  } catch (error) {
    return {
      ...state,
      queryResponses: [],
      errors: [...state.errors, {
        type: "PARALLEL_QUERY_ERROR",
        message: error instanceof Error ? error.message : "Failed to run parallel queries"
      }]
    };
  }
};

// Node to evaluate and select the best response
const evaluateBestResponseNode = async (state: z.infer<typeof stateSchema>) => {
  try {
    if (state.queryResponses.length === 0) {
      throw new Error("No responses to evaluate");
    }

    const evaluationPrompt = `You are an expert at evaluating AI responses. Given the original user query and multiple responses, select the best response based on:
1. Accuracy and relevance to the original question
2. Completeness and depth of information
3. Clarity and coherence
4. Practical usefulness

Original Query: "${state.originalQuery}"

Responses to evaluate:
${state.queryResponses.map((r: { query: string; response: string }, i: number) => `
Response ${i + 1} (from query: "${r.query}"):
${r.response}
---
`).join('\n')}

Please respond with ONLY the complete text of the best response, without any additional commentary or explanation.`;

    const bestResponse = await callPollinationsAI(evaluationPrompt);

    return {
      ...state,
      bestResponse,
      messages: [...state.messages,
        { role: "user", content: state.originalQuery },
        { role: "assistant", content: bestResponse }
      ]
    };
  } catch (error) {
    // Fallback: use the first response if evaluation fails
    const fallbackResponse = state.queryResponses[0]?.response || "Sorry, I couldn't process your query.";
    return {
      ...state,
      bestResponse: fallbackResponse,
      messages: [...state.messages,
        { role: "user", content: state.originalQuery },
        { role: "assistant", content: fallbackResponse }
      ],
      errors: [...state.errors, {
        type: "EVALUATION_ERROR",
        message: error instanceof Error ? error.message : "Failed to evaluate responses"
      }]
    };
  }
};

// Create the enhanced workflow
const workflow = new StateGraph(stateSchema)
  .addNode("generateVariations", generateVariationsNode)
  .addNode("runParallelQueries", runParallelQueriesNode)
  .addNode("evaluateBestResponse", evaluateBestResponseNode)
  .addEdge(START, "generateVariations")
  .addEdge("generateVariations", "runParallelQueries")
  .addEdge("runParallelQueries", "evaluateBestResponse")
  .addEdge("evaluateBestResponse", END)
  .compile();

// Create a function to process messages using the enhanced graph
export async function processMessage(message: string) {
  try {
    const result = await workflow.invoke({
      messages: [],
      currentMessage: message,
      originalQuery: message,
      queryVariations: [],
      queryResponses: [],
      bestResponse: "",
      errors: []
    });
    
    console.log("Query variations used:", result.queryVariations);
    console.log("Errors (if any):", result.errors);
    
    return result.messages;
  } catch (error) {
    console.error("Error processing message:", error);
    throw error;
  }
}
