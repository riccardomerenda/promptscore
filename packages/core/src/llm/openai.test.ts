import { describe, expect, it } from 'vitest';
import { createOpenAiResponsesClient } from './openai.js';

describe('createOpenAiResponsesClient', () => {
  it('sends a Responses API request and parses output_text', async () => {
    let requestUrl = '';
    let requestInit: RequestInit | undefined;

    const client = createOpenAiResponsesClient({
      apiKey: 'secret',
      model: 'gpt-5-mini',
      baseUrl: 'https://example.com/v1/',
      fetchImpl: async (input, init) => {
        requestUrl = String(input);
        requestInit = init;
        return new Response(
          JSON.stringify({
            model: 'gpt-5-mini',
            output_text: '{"passed":true}',
            usage: {
              input_tokens: 10,
              output_tokens: 4,
              total_tokens: 14,
            },
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
      },
    });

    const response = await client.generateText({
      instructions: 'Return JSON.',
      input: 'Review this prompt.',
      temperature: 0,
      maxOutputTokens: 200,
    });

    expect(requestUrl).toBe('https://example.com/v1/responses');
    expect(requestInit?.method).toBe('POST');
    expect(requestInit?.headers).toMatchObject({
      Authorization: 'Bearer secret',
      'Content-Type': 'application/json',
    });
    expect(JSON.parse(String(requestInit?.body))).toEqual({
      model: 'gpt-5-mini',
      input: 'Review this prompt.',
      instructions: 'Return JSON.',
      temperature: 0,
      max_output_tokens: 200,
    });
    expect(response.text).toBe('{"passed":true}');
    expect(response.usage).toEqual({
      inputTokens: 10,
      outputTokens: 4,
      totalTokens: 14,
    });
  });

  it('falls back to message content when output_text is absent', async () => {
    const client = createOpenAiResponsesClient({
      apiKey: 'secret',
      model: 'gpt-5-mini',
      fetchImpl: async () =>
        new Response(
          JSON.stringify({
            output: [
              {
                type: 'message',
                content: [
                  {
                    type: 'output_text',
                    text: '{"passed":false}',
                  },
                ],
              },
            ],
          }),
          { status: 200 },
        ),
    });

    const response = await client.generateText({
      instructions: 'Return JSON.',
      input: 'Review this prompt.',
    });

    expect(response.text).toBe('{"passed":false}');
  });

  it('throws a helpful error when the API returns a failure', async () => {
    const client = createOpenAiResponsesClient({
      apiKey: 'secret',
      model: 'gpt-5-mini',
      fetchImpl: async () =>
        new Response(
          JSON.stringify({
            error: {
              message: 'Invalid API key',
            },
          }),
          { status: 401, statusText: 'Unauthorized' },
        ),
    });

    await expect(
      client.generateText({
        instructions: 'Return JSON.',
        input: 'Review this prompt.',
      }),
    ).rejects.toThrow('Invalid API key');
  });
});
