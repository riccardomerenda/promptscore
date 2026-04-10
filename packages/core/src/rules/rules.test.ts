import { describe, expect, it } from 'vitest';
import { parsePrompt } from '../parser/index.js';
import { deterministicRules } from './deterministic/index.js';
import type { Profile } from '../profiles/types.js';

const emptyProfile: Profile = {
  name: 'test',
  displayName: 'Test',
  rules: {},
  bestPractices: [],
};

async function runAll(prompt: string) {
  const ast = parsePrompt(prompt);
  const results = await Promise.all(
    deterministicRules.map((r) => r.check({ ast, profile: emptyProfile })),
  );
  const byId = new Map(results.map((r) => [r.ruleId, r]));
  return byId;
}

describe('deterministic rules', () => {
  it('flags a tiny prompt on min-length and missing-task', async () => {
    const results = await runAll('Do it.');
    expect(results.get('min-length')!.passed).toBe(false);
  });

  it('passes min-length for a sufficiently detailed prompt', async () => {
    const prompt =
      'You are a senior engineer. Your task is to review this code and point out ' +
      'security issues in the authentication flow. Be specific and cite line numbers.';
    const results = await runAll(prompt);
    expect(results.get('min-length')!.passed).toBe(true);
  });

  it('fails no-output-format when format is missing', async () => {
    const prompt =
      'You are a helpful assistant. Your task is to summarize articles concisely for busy readers.';
    const results = await runAll(prompt);
    expect(results.get('no-output-format')!.passed).toBe(false);
  });

  it('passes no-output-format when format is present', async () => {
    const prompt =
      'You are a helpful assistant. Your task is to summarize articles. Return the output as JSON.';
    const results = await runAll(prompt);
    expect(results.get('no-output-format')!.passed).toBe(true);
  });

  it('flags vague qualifiers', async () => {
    const prompt =
      'You are a writer. Produce a good, nice, appropriate summary that is proper and correct.';
    const results = await runAll(prompt);
    expect(results.get('vague-instruction')!.passed).toBe(false);
  });

  it('flags excessive all caps', async () => {
    const prompt =
      'YOU MUST NEVER FORGET THIS RULE. ALWAYS RETURN JSON OUTPUT WHEN ASKED TO DO ANYTHING.';
    const results = await runAll(prompt);
    expect(results.get('all-caps-abuse')!.passed).toBe(false);
  });
});
