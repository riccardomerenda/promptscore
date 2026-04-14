import { describe, expect, it } from 'vitest';
import { parsePrompt } from '../../parser/index.js';
import type { LlmClient } from '../../llm/types.js';
import type { Profile } from '../../profiles/types.js';
import { llmPromptReviewRule } from './prompt-review.js';

const profile: Profile = {
  name: 'gpt',
  displayName: 'GPT',
  rules: {},
  bestPractices: ['Ask for a specific output format.', 'State concrete success criteria.'],
};

describe('llmPromptReviewRule', () => {
  it('parses structured JSON from a client response', async () => {
    const llm: LlmClient = {
      provider: 'test',
      model: 'stub',
      async generateText() {
        return {
          provider: 'test',
          model: 'stub',
          text: JSON.stringify({
            passed: false,
            score: 62,
            message: 'The prompt leaves success criteria implicit.',
            suggestion: 'Define the acceptance criteria for a good answer.',
          }),
        };
      },
    };

    const ast = parsePrompt('You are a helpful assistant. Summarize this article.');
    const result = await llmPromptReviewRule.check({ ast, profile, llm });

    expect(result.passed).toBe(false);
    expect(result.score).toBe(62);
    expect(result.message).toContain('success criteria');
    expect(result.suggestion).toContain('acceptance criteria');
  });

  it('accepts fenced JSON output', async () => {
    const llm: LlmClient = {
      provider: 'test',
      model: 'stub',
      async generateText() {
        return {
          provider: 'test',
          model: 'stub',
          text: '```json\n{"passed": true, "score": 91, "message": "Prompt is well specified.", "suggestion": ""}\n```',
        };
      },
    };

    const ast = parsePrompt(
      'You are a helpful assistant. Your task is to summarize this article. Return JSON with title and summary.',
    );
    const result = await llmPromptReviewRule.check({ ast, profile, llm });

    expect(result.passed).toBe(true);
    expect(result.score).toBe(91);
  });
});
