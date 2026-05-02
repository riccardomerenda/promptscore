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
    expect(result.message).toContain('Success criteria:');
    expect(result.message).toContain('success criteria');
    expect(result.suggestion).toContain('Define success criteria:');
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
    expect(result.suggestion).toBeUndefined();
    expect(result.reference).toBe('https://promptscore.dev/docs/rules#llm-prompt-review');
  });

  it('uses explicit issue_type values to structure failed guidance', async () => {
    const llm: LlmClient = {
      provider: 'test',
      model: 'stub',
      async generateText() {
        return {
          provider: 'test',
          model: 'stub',
          text: JSON.stringify({
            passed: false,
            score: 44,
            issue_type: 'conflict',
            message: 'The prompt asks for JSON and plain text at the same time.',
            suggestion: 'Choose one output contract and remove the incompatible instruction.',
          }),
        };
      },
    };

    const ast = parsePrompt('Return JSON. Do not return JSON.');
    const result = await llmPromptReviewRule.check({ ast, profile, llm });

    expect(result.message).toBe(
      'Conflicting instructions: The prompt asks for JSON and plain text at the same time.',
    );
    expect(result.suggestion).toBe(
      'Resolve the conflicting instructions: Choose one output contract and remove the incompatible instruction.',
    );
    expect(result.reference).toBe('https://promptscore.dev/docs/rules#llm-prompt-review-conflict');
  });

  it('falls back to issue-specific default suggestions when the client omits guidance', async () => {
    const llm: LlmClient = {
      provider: 'test',
      model: 'stub',
      async generateText() {
        return {
          provider: 'test',
          model: 'stub',
          text: JSON.stringify({
            passed: false,
            score: 35,
            issueType: 'task-framing',
            message: 'The prompt asks the model to guarantee unknowable outcomes.',
            suggestion: '',
          }),
        };
      },
    };

    const ast = parsePrompt('Guarantee this answer is legally risk-free.');
    const result = await llmPromptReviewRule.check({ ast, profile, llm });

    expect(result.message).toContain('Task framing:');
    expect(result.suggestion).toContain('Reframe the task:');
    expect(result.suggestion).toContain('reasonably complete and verify');
    expect(result.reference).toBe(
      'https://promptscore.dev/docs/rules#llm-prompt-review-task-framing',
    );
  });

  it('attaches a per-issue rewrite snippet on each non-general failure', async () => {
    const cases: Array<{
      issueType: string;
      expectedTitle: string;
      expectedPlacement: 'prepend' | 'append';
    }> = [
      {
        issueType: 'ambiguity',
        expectedTitle: 'ambiguous parts explicit',
        expectedPlacement: 'append',
      },
      { issueType: 'conflict', expectedTitle: 'one consistent set', expectedPlacement: 'append' },
      { issueType: 'grounding', expectedTitle: 'missing grounding', expectedPlacement: 'append' },
      {
        issueType: 'success-criteria',
        expectedTitle: 'measurable success criteria',
        expectedPlacement: 'append',
      },
      {
        issueType: 'task-framing',
        expectedTitle: 'verifiable',
        expectedPlacement: 'prepend',
      },
    ];

    for (const testCase of cases) {
      const llm: LlmClient = {
        provider: 'test',
        model: 'stub',
        async generateText() {
          return {
            provider: 'test',
            model: 'stub',
            text: JSON.stringify({
              passed: false,
              score: 40,
              issue_type: testCase.issueType,
              message: 'fixture body',
              suggestion: 'fixture suggestion',
            }),
          };
        },
      };

      const ast = parsePrompt('whatever the prompt is for the test');
      const result = await llmPromptReviewRule.check({ ast, profile, llm });

      expect(result.rewrite, `${testCase.issueType} should expose a rewrite`).toBeDefined();
      expect(result.rewrite!.placement).toBe(testCase.expectedPlacement);
      expect(result.rewrite!.title.toLowerCase()).toContain(testCase.expectedTitle.toLowerCase());
      expect(result.rewrite!.snippet.length).toBeGreaterThan(0);
    }
  });

  it('omits the rewrite when the LLM passes or returns a generic failure', async () => {
    const passingClient: LlmClient = {
      provider: 'test',
      model: 'stub',
      async generateText() {
        return {
          provider: 'test',
          model: 'stub',
          text: JSON.stringify({
            passed: true,
            score: 90,
            issue_type: 'general',
            message: 'Looks good.',
            suggestion: '',
          }),
        };
      },
    };

    const passing = await llmPromptReviewRule.check({
      ast: parsePrompt('You are a tutor. Your task is to summarize. Return JSON.'),
      profile,
      llm: passingClient,
    });
    expect(passing.passed).toBe(true);
    expect(passing.rewrite).toBeUndefined();

    const genericFailClient: LlmClient = {
      provider: 'test',
      model: 'stub',
      async generateText() {
        return {
          provider: 'test',
          model: 'stub',
          text: JSON.stringify({
            passed: false,
            score: 60,
            issue_type: 'general',
            message: 'Could be tighter overall.',
            suggestion: 'Tighten the prompt overall.',
          }),
        };
      },
    };

    const genericFail = await llmPromptReviewRule.check({
      ast: parsePrompt('Make it nicer.'),
      profile,
      llm: genericFailClient,
    });
    expect(genericFail.passed).toBe(false);
    expect(genericFail.rewrite).toBeUndefined();
  });
});
