import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { BaseMessage } from "@langchain/core/messages";
import { RunnableConfig } from "@langchain/core/runnables";
import { BasePromptValueInterface } from "@langchain/core/prompt_values";
import { Callbacks } from "@langchain/core/callbacks/manager";
import { LLMResult } from "@langchain/core/outputs";
import { BaseLanguageModelCallOptions } from "@langchain/core/language_models/base";

export class PollinationsLLM extends BaseLanguageModel {
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