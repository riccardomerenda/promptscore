import { describe, expect, it } from 'vitest';
import { createLlmClient, resolveProvider } from './index.js';

describe('resolveProvider', () => {
  it('uses the explicit provider from config', () => {
    expect(resolveProvider({ provider: 'openai' }, {} as NodeJS.ProcessEnv)).toBe('openai');
  });

  it('falls back to openai when OPENAI_API_KEY is present', () => {
    expect(resolveProvider(undefined, { OPENAI_API_KEY: 'test-key' } as NodeJS.ProcessEnv)).toBe(
      'openai',
    );
  });

  it('returns undefined when no provider hints are available', () => {
    expect(resolveProvider(undefined, {} as NodeJS.ProcessEnv)).toBeUndefined();
  });
});

describe('createLlmClient', () => {
  it('returns undefined when no provider is configured', () => {
    expect(createLlmClient(undefined, {} as NodeJS.ProcessEnv)).toBeUndefined();
  });

  it('creates an OpenAI client from config and env', () => {
    const client = createLlmClient(
      {
        provider: 'openai',
        model: 'gpt-5',
        apiKeyEnv: 'PROMPTSCORE_OPENAI_KEY',
        baseUrl: 'https://example.com/v1',
      },
      {
        PROMPTSCORE_OPENAI_KEY: 'secret',
      } as NodeJS.ProcessEnv,
    );

    expect(client).toBeDefined();
    expect(client?.provider).toBe('openai');
    expect(client?.model).toBe('gpt-5');
  });

  it('throws when the configured api key env var is missing', () => {
    expect(() =>
      createLlmClient(
        {
          provider: 'openai',
          apiKeyEnv: 'MISSING_KEY',
        },
        {} as NodeJS.ProcessEnv,
      ),
    ).toThrow('environment variable "MISSING_KEY" is not set');
  });
});
