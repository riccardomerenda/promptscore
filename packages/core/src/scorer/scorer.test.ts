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

  it('populates a reference URL for every deterministic rule result', async () => {
    const ast = parsePrompt('do it');
    const results = await runRules({ rules: deterministicRules, profile, ast });
    expect(results).toHaveLength(deterministicRules.length);
    for (const result of results) {
      expect(result.reference, `${result.ruleId} should carry a reference`).toMatch(
        /^https:\/\/promptscore\.dev\/docs\/rules#/,
      );
    }
  });

  it('attaches rewrite snippets to failing rules that support them', async () => {
    const ast = parsePrompt('do it');
    const results = await runRules({ rules: deterministicRules, profile, ast });

    const REWRITE_SUPPORTED = new Set([
      'missing-task',
      'no-role',
      'no-context',
      'min-length',
      'no-output-format',
      'no-examples',
      'no-constraints',
    ]);

    for (const result of results) {
      if (!result.passed && REWRITE_SUPPORTED.has(result.ruleId)) {
        expect(result.rewrite, `${result.ruleId} should expose a rewrite`).toBeDefined();
        expect(result.rewrite!.snippet.length).toBeGreaterThan(0);
        expect(result.rewrite!.title.length).toBeGreaterThan(0);
        expect(['prepend', 'append']).toContain(result.rewrite!.placement);
      }
      if (!REWRITE_SUPPORTED.has(result.ruleId)) {
        expect(
          result.rewrite,
          `${result.ruleId} is not rewrite-supported and must not expose a rewrite`,
        ).toBeUndefined();
      }
    }
  });

  it('omits rewrite when a rule passes', async () => {
    const ast = parsePrompt(
      'You are a senior backend engineer. Your task is to summarize this article. Return JSON with title and summary fields. Keep the summary under 60 words.',
    );
    const results = await runRules({ rules: deterministicRules, profile, ast });
    for (const result of results) {
      if (result.passed) {
        expect(result.rewrite).toBeUndefined();
      }
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
