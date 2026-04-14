import type { PromptScoreLlmConfig } from '../config/types.js';
import { createOpenAiResponsesClient } from './openai.js';
import type { LlmClient, LlmProvider } from './types.js';

const DEFAULT_OPENAI_MODEL = 'gpt-5-mini';
const DEFAULT_OPENAI_API_KEY_ENV = 'OPENAI_API_KEY';
const DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com/v1';

export { createOpenAiResponsesClient } from './openai.js';
export type {
  LlmClient,
  LlmGenerateTextRequest,
  LlmGenerateTextResponse,
  LlmProvider,
  LlmUsage,
} from './types.js';

export function createLlmClient(
  config: PromptScoreLlmConfig | undefined,
  env: NodeJS.ProcessEnv = process.env,
): LlmClient | undefined {
  const provider = resolveProvider(config, env);
  if (!provider) {
    return undefined;
  }

  if (provider !== 'openai') {
    throw new Error(`Unsupported LLM provider: ${provider}`);
  }

  const apiKeyEnv = config?.apiKeyEnv ?? DEFAULT_OPENAI_API_KEY_ENV;
  const apiKey = env[apiKeyEnv];
  if (!apiKey?.trim()) {
    throw new Error(
      `LLM provider "${provider}" is configured but environment variable "${apiKeyEnv}" is not set.`,
    );
  }

  const model = config?.model ?? env.PROMPTSCORE_LLM_MODEL ?? DEFAULT_OPENAI_MODEL;
  const baseUrl = config?.baseUrl ?? env.PROMPTSCORE_OPENAI_BASE_URL ?? DEFAULT_OPENAI_BASE_URL;

  return createOpenAiResponsesClient({
    apiKey: apiKey.trim(),
    model,
    baseUrl,
  });
}

export function resolveProvider(
  config: PromptScoreLlmConfig | undefined,
  env: NodeJS.ProcessEnv = process.env,
): LlmProvider | undefined {
  const configured = config?.provider ?? env.PROMPTSCORE_LLM_PROVIDER;
  if (configured === 'openai') {
    return configured;
  }

  if (!configured && env.OPENAI_API_KEY) {
    return 'openai';
  }

  return undefined;
}
