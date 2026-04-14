import type {
  LlmClient,
  LlmGenerateTextRequest,
  LlmGenerateTextResponse,
  LlmUsage,
} from './types.js';

const DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com/v1';

interface OpenAiResponsesClientOptions {
  apiKey: string;
  model: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

interface OpenAiResponsesApiResponse {
  model?: string;
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
      refusal?: string;
    }>;
  }>;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
  };
  error?: {
    message?: string;
  };
}

export function createOpenAiResponsesClient(options: OpenAiResponsesClientOptions): LlmClient {
  const baseUrl = normalizeBaseUrl(options.baseUrl ?? DEFAULT_OPENAI_BASE_URL);
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;

  if (typeof fetchImpl !== 'function') {
    throw new Error('Fetch API is not available in this runtime. Cannot create OpenAI LLM client.');
  }

  return {
    provider: 'openai',
    model: options.model,
    async generateText(request: LlmGenerateTextRequest): Promise<LlmGenerateTextResponse> {
      const response = await fetchImpl(`${baseUrl}/responses`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${options.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildRequestBody(options.model, request)),
      });

      const rawText = await response.text();
      const payload = parseJson<OpenAiResponsesApiResponse>(rawText);

      if (!response.ok) {
        const detail = payload?.error?.message ?? rawText.trim() ?? response.statusText;
        throw new Error(
          `OpenAI Responses API request failed (${response.status} ${response.statusText}): ${truncate(detail, 500)}`,
        );
      }

      const text = extractResponseText(payload);
      if (!text.trim()) {
        throw new Error('OpenAI Responses API returned no text output.');
      }

      return {
        provider: 'openai',
        model: payload?.model ?? options.model,
        text,
        usage: normalizeUsage(payload?.usage),
        raw: payload,
      };
    },
  };
}

function buildRequestBody(model: string, request: LlmGenerateTextRequest): Record<string, unknown> {
  const body: Record<string, unknown> = {
    model,
    input: request.input,
    instructions: request.instructions,
  };

  if (request.temperature !== undefined) {
    body.temperature = request.temperature;
  }

  if (request.maxOutputTokens !== undefined) {
    body.max_output_tokens = request.maxOutputTokens;
  }

  return body;
}

function extractResponseText(payload: OpenAiResponsesApiResponse | undefined): string {
  if (!payload) return '';
  if (typeof payload.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const textParts: string[] = [];
  for (const item of payload.output ?? []) {
    if (item?.type !== 'message' || !Array.isArray(item.content)) continue;
    for (const content of item.content) {
      if (content?.type === 'output_text' && typeof content.text === 'string') {
        textParts.push(content.text);
      } else if (content?.type === 'refusal' && typeof content.refusal === 'string') {
        textParts.push(content.refusal);
      }
    }
  }

  return textParts.join('\n').trim();
}

function normalizeUsage(
  usage:
    | {
        input_tokens?: number;
        output_tokens?: number;
        total_tokens?: number;
      }
    | undefined,
): LlmUsage | undefined {
  if (!usage) return undefined;
  return {
    inputTokens: usage.input_tokens,
    outputTokens: usage.output_tokens,
    totalTokens: usage.total_tokens,
  };
}

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, '');
}

function parseJson<T>(value: string): T | undefined {
  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 3)}...`;
}
