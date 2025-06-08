import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { BaseMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableConfig, RunnableSequence } from "@langchain/core/runnables";
import { BasePromptValueInterface } from "@langchain/core/prompt_values";
import { Callbacks } from "@langchain/core/callbacks/manager";
import { LLMResult } from "@langchain/core/outputs";
import { BaseLanguageModelCallOptions } from "@langchain/core/language_models/base";

// Create a custom LLM class for Pollinations API
class PollinationsLLM extends BaseLanguageModel {
  private baseUrl = "https://text.pollinations.ai";

  constructor(params: { baseUrl?: string } = {}) {
    super({});
    if (params.baseUrl) {
      this.baseUrl = params.baseUrl;
    }
  }

  async _call(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/${encodeURIComponent(prompt)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.text();
      return data;
    } catch (error) {
      console.error("Error calling Pollinations API:", error);
      throw error;
    }
  }

  _llmType(): string {
    return "pollinations";
  }

  _modelType(): string {
    return "pollinations";
  }

  async invoke(input: string, config?: RunnableConfig): Promise<string> {
    return this._call(input);
  }

  get lc_namespace(): string[] {
    return ["langchain", "llms", "pollinations"];
  }

  async generatePrompt(
    promptValues: BasePromptValueInterface[],
    options?: BaseLanguageModelCallOptions | string[],
    callbacks?: Callbacks
  ): Promise<LLMResult> {
    throw new Error("Method not implemented.");
  }

  async predict(): Promise<string> {
    throw new Error("Method not implemented.");
  }

  async predictMessages(): Promise<BaseMessage> {
    throw new Error("Method not implemented.");
  }
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
