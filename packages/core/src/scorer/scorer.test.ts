import { describe, expect, it } from 'vitest';
import { parsePrompt } from '../parser/index.js';
import { buildReport, runRules } from './index.js';
import { deterministicRules } from '../rules/deterministic/index.js';
import type { Profile } from '../profiles/types.js';
import { llmPromptReviewRule } from '../rules/llm/index.js';

const profile: Profile = {
  name: 'test',
  displayName: 'Test',
  rules: {},
  bestPractices: [],
};

describe('scorer', () => {
  it('produces an overall score and categories', async () => {
    const ast = parsePrompt(
      'You are a helpful assistant. Your task is to summarize long articles into JSON.',
    );
    const results = await runRules({ rules: deterministicRules, profile, ast });
    const report = buildReport(results, profile);
    expect(report.overall).toBeGreaterThanOrEqual(0);
    expect(report.overall).toBeLessThanOrEqual(100);
    expect(report.categories.length).toBeGreaterThan(0);
    expect(report.summary).toContain('Score');
  });

  it('orders suggestions by impact', async () => {
    const ast = parsePrompt('do it');
    const results = await runRules({ rules: deterministicRules, profile, ast });
    const report = buildReport(results, profile);
    for (let i = 1; i < report.suggestions.length; i++) {
      const prev = report.suggestions[i - 1]!.impact;
      const curr = report.suggestions[i]!.impact;
      expect(prev).toBeGreaterThanOrEqual(curr);
    }
  });

  it('throws a helpful error when llm rules are enabled without a client', async () => {
    const ast = parsePrompt('You are a helpful assistant. Summarize this article.');

    await expect(
      runRules({
        rules: [llmPromptReviewRule],
        profile,
        ast,
        includeLlm: true,
      }),
    ).rejects.toThrow('LLM-backed rules were enabled but no LLM client is configured');
  });
});
