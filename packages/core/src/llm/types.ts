export type LlmProvider = 'openai';

export interface LlmUsage {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
}

export interface LlmGenerateTextRequest {
  instructions: string;
  input: string;
  temperature?: number;
  maxOutputTokens?: number;
}

export interface LlmGenerateTextResponse {
  provider: LlmProvider | string;
  model: string;
  text: string;
  usage?: LlmUsage;
  raw?: unknown;
}

export interface LlmClient {
  readonly provider: LlmProvider | string;
  readonly model: string;
  generateText(request: LlmGenerateTextRequest): Promise<LlmGenerateTextResponse>;
}
