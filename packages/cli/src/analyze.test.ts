import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import type { BatchReport, ScoreReport } from '@promptscore/core';
import { getExitCode, resolveAnalyzeSource, resolveConfigSearchDir } from './analyze.js';

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('resolveAnalyzeSource', () => {
  it('expands directories using prompt-friendly extensions only', async () => {
    const dir = await createTempDir();
    await mkdir(join(dir, 'prompts'), { recursive: true });
    await mkdir(join(dir, 'prompts', 'nested'), { recursive: true });
    await mkdir(join(dir, 'node_modules'), { recursive: true });

    await writeFile(join(dir, 'prompts', 'a.txt'), 'Prompt A', 'utf8');
    await writeFile(join(dir, 'prompts', 'nested', 'b.md'), 'Prompt B', 'utf8');
    await writeFile(join(dir, 'prompts', 'nested', 'ignore.json'), '{}', 'utf8');
    await writeFile(join(dir, 'node_modules', 'skip.txt'), 'skip', 'utf8');

    const resolved = await resolveAnalyzeSource(['prompts'], undefined, dir);

    expect(resolved?.kind).toBe('files');
    expect(
      resolved && 'files' in resolved ? resolved.files.map((file) => file.displayPath) : [],
    ).toEqual(['prompts/a.txt', 'prompts/nested/b.md']);
  });

  it('expands glob inputs and deduplicates overlaps', async () => {
    const dir = await createTempDir();
    await mkdir(join(dir, 'prompts', 'nested'), { recursive: true });
    await writeFile(join(dir, 'prompts', 'a.txt'), 'Prompt A', 'utf8');
    await writeFile(join(dir, 'prompts', 'nested', 'b.md'), 'Prompt B', 'utf8');

    const resolved = await resolveAnalyzeSource(
      ['prompts/**/*.{txt,md}', 'prompts/a.txt'],
      undefined,
      dir,
    );

    expect(resolved?.kind).toBe('files');
    expect(
      resolved && 'files' in resolved ? resolved.files.map((file) => file.displayPath) : [],
    ).toEqual(['prompts/a.txt', 'prompts/nested/b.md']);
  });

  it('rejects mixing inline prompts with file inputs', async () => {
    await expect(
      resolveAnalyzeSource(['examples/good/classifier.txt'], 'inline prompt'),
    ).rejects.toThrow('Cannot combine --inline');
  });
});

describe('resolveConfigSearchDir', () => {
  it('uses the directory itself for directory inputs', async () => {
    const dir = await createTempDir();
    await mkdir(join(dir, 'prompts'), { recursive: true });

    expect(resolveConfigSearchDir(['prompts'], dir)).toBe(join(dir, 'prompts'));
  });

  it('uses the static prefix for glob inputs', async () => {
    const dir = await createTempDir();
    await mkdir(join(dir, 'prompts', 'nested'), { recursive: true });

    expect(resolveConfigSearchDir(['prompts/**/*.txt'], dir)).toBe(join(dir, 'prompts'));
  });
});

describe('getExitCode', () => {
  it('applies fail-on thresholds to single reports', () => {
    const report = createSingleReport({
      results: [{ passed: false, severity: 'warning' }],
    });

    expect(getExitCode(report, 'error')).toBe(0);
    expect(getExitCode(report, 'warning')).toBe(1);
    expect(getExitCode(report, 'info')).toBe(1);
    expect(getExitCode(report, 'none')).toBe(0);
  });

  it('applies fail-on thresholds to batch reports', () => {
    const report = createBatchReport({
      error: 0,
      warning: 2,
      info: 1,
      total: 3,
    });

    expect(getExitCode(report, 'error')).toBe(0);
    expect(getExitCode(report, 'warning')).toBe(1);
    expect(getExitCode(report, 'info')).toBe(1);
  });
});

async function createTempDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'promptscore-cli-'));
  tempDirs.push(dir);
  return dir;
}

function createSingleReport(input: {
  results: Array<{ passed: boolean; severity: 'error' | 'warning' | 'info' }>;
}): ScoreReport {
  return {
    overall: 50,
    categories: [],
    summary: 'summary',
    suggestions: [],
    profileName: '_base',
    results: input.results.map((result, index) => ({
      ruleId: `rule-${index}`,
      passed: result.passed,
      score: result.passed ? 100 : 50,
      message: 'message',
      severity: result.severity,
      category: 'clarity',
      weight: 1,
      suggestion: 'suggestion',
    })),
  };
}

function createBatchReport(counts: BatchReport['summary']['findings']): BatchReport {
  return {
    kind: 'batch',
    summary: {
      files: 2,
      passedFiles: 1,
      failedFiles: 1,
      averageScore: 62,
      findings: counts,
      profiles: ['gpt'],
    },
    worstFiles: [],
    files: [],
  };
}
