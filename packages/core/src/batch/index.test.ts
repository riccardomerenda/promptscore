import { describe, expect, it } from 'vitest';
import { format } from '../reporter/index.js';
import type { ScoreReport } from '../scorer/index.js';
import type { RuleResult } from '../rules/types.js';
import { buildBatchReport, countFindings } from './index.js';

describe('batch reporting', () => {
  it('counts findings by severity', () => {
    const counts = countFindings([
      createResult({ ruleId: 'missing-task', passed: false, severity: 'error' }),
      createResult({ ruleId: 'no-output-format', passed: false, severity: 'warning' }),
      createResult({ ruleId: 'no-role', passed: false, severity: 'info' }),
      createResult({ ruleId: 'min-length', passed: true, severity: 'info' }),
    ]);

    expect(counts).toEqual({
      error: 1,
      warning: 1,
      info: 1,
      total: 3,
    });
  });

  it('builds aggregate summaries and sorts worst files', () => {
    const batch = buildBatchReport([
      {
        path: 'examples/good/classifier.txt',
        report: createReport({
          overall: 91,
          profileName: 'claude',
          results: [createResult({ ruleId: 'missing-task', passed: true, severity: 'error' })],
        }),
      },
      {
        path: 'examples/bad/vague.txt',
        report: createReport({
          overall: 25,
          profileName: 'gpt',
          results: [
            createResult({ ruleId: 'vague-instruction', passed: false, severity: 'warning' }),
          ],
        }),
      },
      {
        path: 'examples/bad/no-format.txt',
        report: createReport({
          overall: 40,
          profileName: 'gpt',
          results: [
            createResult({ ruleId: 'no-output-format', passed: false, severity: 'error' }),
            createResult({ ruleId: 'no-examples', passed: false, severity: 'warning' }),
          ],
        }),
      },
    ]);

    expect(batch.summary.files).toBe(3);
    expect(batch.summary.failedFiles).toBe(2);
    expect(batch.summary.passedFiles).toBe(1);
    expect(Math.round(batch.summary.averageScore)).toBe(52);
    expect(batch.summary.findings).toEqual({
      error: 1,
      warning: 2,
      info: 0,
      total: 3,
    });
    expect(batch.summary.profiles).toEqual(['claude', 'gpt']);
    expect(batch.worstFiles.map((file) => file.path)).toEqual([
      'examples/bad/vague.txt',
      'examples/bad/no-format.txt',
      'examples/good/classifier.txt',
    ]);
  });

  it('formats batch reports in text, json, and markdown', () => {
    const batch = buildBatchReport([
      {
        path: 'examples/bad/vague.txt',
        report: createReport({
          overall: 25,
          profileName: 'gpt',
          results: [
            createResult({ ruleId: 'vague-instruction', passed: false, severity: 'warning' }),
          ],
        }),
      },
      {
        path: 'examples/good/classifier.txt',
        report: createReport({
          overall: 91,
          profileName: 'gpt',
          results: [createResult({ ruleId: 'missing-task', passed: true, severity: 'error' })],
        }),
      },
    ]);

    const text = format(batch, 'text', { color: false });
    const json = format(batch, 'json');
    const markdown = format(batch, 'markdown');

    expect(text).toContain('PromptScore — batch report');
    expect(text).toContain('Files');
    expect(text).toContain('Findings By File');
    expect(json).toContain('"kind": "batch"');
    expect(markdown).toContain('# PromptScore — batch report');
    expect(markdown).toContain('## Files');
  });

  it('renders rule references in batch text and markdown findings', () => {
    const batch = buildBatchReport([
      {
        path: 'examples/bad/vague.txt',
        report: createReport({
          overall: 25,
          profileName: 'gpt',
          results: [
            createResult({
              ruleId: 'vague-instruction',
              passed: false,
              severity: 'warning',
              reference: 'https://promptscore.dev/docs/rules#vague-instruction',
            }),
          ],
        }),
      },
    ]);

    const text = format(batch, 'text', { color: false });
    const markdown = format(batch, 'markdown');

    expect(text).toContain('see: https://promptscore.dev/docs/rules#vague-instruction');
    expect(markdown).toContain('Reference: https://promptscore.dev/docs/rules#vague-instruction');
  });

  it('renders rewrite snippets in batch text and markdown findings', () => {
    const batch = buildBatchReport([
      {
        path: 'examples/bad/short.txt',
        report: createReport({
          overall: 22,
          profileName: 'claude',
          results: [
            createResult({
              ruleId: 'missing-task',
              passed: false,
              severity: 'error',
              rewrite: {
                title: 'Add an explicit task',
                placement: 'prepend',
                snippet: 'Your task is to <verb> <object>.',
              },
            }),
          ],
        }),
      },
    ]);

    const text = format(batch, 'text', { color: false });
    const markdown = format(batch, 'markdown');
    const json = format(batch, 'json');

    expect(text).toContain('rewrite (prepend): Add an explicit task');
    expect(text).toContain('Your task is to <verb> <object>.');
    expect(markdown).toContain('Rewrite (prepend): Add an explicit task');
    expect(markdown).toContain('Your task is to <verb> <object>.');
    expect(json).toContain('"rewrite":');
    expect(json).toContain('"placement": "prepend"');
  });

  it('renders rewrite snippets in single-file text and markdown findings', () => {
    const report = createReport({
      overall: 33,
      profileName: 'gpt',
      results: [
        createResult({
          ruleId: 'no-output-format',
          passed: false,
          severity: 'warning',
          rewrite: {
            title: 'Specify the output format',
            placement: 'append',
            snippet: '<output_format>\n  Return JSON.\n</output_format>',
          },
        }),
      ],
    });

    const text = format(report, 'text', { color: false });
    const markdown = format(report, 'markdown');

    expect(text).toContain('rewrite (append): Specify the output format');
    expect(text).toContain('Return JSON.');
    expect(markdown).toContain('**Rewrite (append):** Specify the output format');
    expect(markdown).toContain('```text');
    expect(markdown).toContain('Return JSON.');
  });
});

function createReport(input: {
  overall: number;
  profileName: string;
  results: RuleResult[];
}): ScoreReport {
  return {
    overall: input.overall,
    categories: [],
    summary: `Score ${Math.round(input.overall)}/100`,
    suggestions: [],
    results: input.results,
    profileName: input.profileName,
  };
}

function createResult(
  overrides: Partial<RuleResult> & Pick<RuleResult, 'ruleId' | 'passed' | 'severity'>,
): RuleResult {
  return {
    ruleId: overrides.ruleId,
    passed: overrides.passed,
    score: overrides.passed ? 100 : 25,
    message: overrides.ruleId,
    severity: overrides.severity,
    category: overrides.category ?? 'clarity',
    weight: overrides.weight ?? 1,
    suggestion: overrides.suggestion ?? 'Tighten the prompt.',
    reference: overrides.reference,
    rewrite: overrides.rewrite,
  };
}
