import { describe, expect, it } from 'vitest';
import type { LlmClient, LlmGenerateTextRequest } from '../../llm/types.js';
import { parsePrompt } from '../../parser/index.js';
import { getBuiltinProfile } from '../../profiles/builtin.js';
import type { RuleResult } from '../types.js';
import {
  promptReviewBenchmarkCases,
  type PromptReviewBenchmarkCase,
} from './prompt-review.fixtures.js';
import { llmPromptReviewRule, type PromptReviewIssueType } from './prompt-review.js';

interface BenchmarkRun {
  fixture: PromptReviewBenchmarkCase;
  request: LlmGenerateTextRequest;
  result: RuleResult;
}

const ISSUE_LABELS: Record<PromptReviewIssueType, string> = {
  ambiguity: 'Ambiguity',
  conflict: 'Conflicting instructions',
  grounding: 'Grounding',
  'success-criteria': 'Success criteria',
  'task-framing': 'Task framing',
  general: 'Prompt quality',
};

const ISSUE_ACTIONS: Record<PromptReviewIssueType, string> = {
  ambiguity: 'Make the ambiguous parts explicit',
  conflict: 'Resolve the conflicting instructions',
  grounding: 'Add the missing grounding',
  'success-criteria': 'Define success criteria',
  'task-framing': 'Reframe the task',
  general: 'Tighten the prompt',
};

describe('llmPromptReviewRule benchmark fixtures', () => {
  it('keeps classification regressions at zero for curated prompt-review cases', async () => {
    const runs = await Promise.all(promptReviewBenchmarkCases.map(runBenchmarkCase));

    const falsePositiveIds = runs
      .filter(({ fixture, result }) => fixture.expectedPassed && !result.passed)
      .map(({ fixture }) => fixture.id);
    const falseNegativeIds = runs
      .filter(({ fixture, result }) => !fixture.expectedPassed && result.passed)
      .map(({ fixture }) => fixture.id);

    expect(falsePositiveIds).toEqual([]);
    expect(falseNegativeIds).toEqual([]);
  });

  it('keeps prompt-review scores and guidance inside expected fixture ranges', async () => {
    const runs = await Promise.all(promptReviewBenchmarkCases.map(runBenchmarkCase));

    for (const { fixture, result } of runs) {
      const [minScore, maxScore] = fixture.expectedScoreRange;

      expect(result.score, `${fixture.id} score`).toBeGreaterThanOrEqual(minScore);
      expect(result.score, `${fixture.id} score`).toBeLessThanOrEqual(maxScore);
      expect(containsEveryKeyword(result.message, fixture.expectedMessageKeywords)).toBe(true);

      if (!fixture.expectedPassed) {
        expect(result.message, `${fixture.id} issue label`).toMatch(
          new RegExp(`^${escapeRegExp(ISSUE_LABELS[fixture.expectedIssueType])}:`),
        );
        expect(result.suggestion, `${fixture.id} suggestion`).toBeDefined();
        expect(result.suggestion, `${fixture.id} issue action`).toMatch(
          new RegExp(`^${escapeRegExp(ISSUE_ACTIONS[fixture.expectedIssueType])}:`),
        );
        expect(
          containsEveryKeyword(result.suggestion ?? '', fixture.expectedSuggestionKeywords),
        ).toBe(true);
      }
    }
  });

  it('passes prompt and profile context into each LLM review request', async () => {
    const runs = await Promise.all(promptReviewBenchmarkCases.map(runBenchmarkCase));

    for (const { fixture, request } of runs) {
      expect(request.temperature, `${fixture.id} temperature`).toBe(0);
      expect(request.maxOutputTokens, `${fixture.id} maxOutputTokens`).toBe(400);
      expect(request.input).toContain(fixture.prompt);
      expect(request.input).toContain('Profile name: gpt');
      expect(request.input).toContain('Profile best practices:');
      expect(request.instructions).toContain('Return only valid JSON');
      expect(request.instructions).toContain('issue_type');
    }
  });

  it('exercises every issue type with at least two fixtures', () => {
    const counts: Record<PromptReviewIssueType, number> = {
      ambiguity: 0,
      conflict: 0,
      grounding: 0,
      'success-criteria': 0,
      'task-framing': 0,
      general: 0,
    };

    for (const fixture of promptReviewBenchmarkCases) {
      counts[fixture.expectedIssueType] += 1;
    }

    for (const issueType of Object.keys(counts) as PromptReviewIssueType[]) {
      expect(
        counts[issueType],
        `expected at least 2 fixtures for issue type ${issueType}`,
      ).toBeGreaterThanOrEqual(2);
    }
  });

  it('exercises both pass and fail outcomes broadly across fixtures', () => {
    const passed = promptReviewBenchmarkCases.filter((fixture) => fixture.expectedPassed);
    const failed = promptReviewBenchmarkCases.filter((fixture) => !fixture.expectedPassed);

    expect(passed.length).toBeGreaterThanOrEqual(2);
    expect(failed.length).toBeGreaterThanOrEqual(passed.length);
    expect(promptReviewBenchmarkCases.length).toBeGreaterThanOrEqual(12);
  });

  it('attaches a rewrite to every failed non-general fixture and never to pass cases', async () => {
    const runs = await Promise.all(promptReviewBenchmarkCases.map(runBenchmarkCase));

    for (const { fixture, result } of runs) {
      const isFailedSpecific = !fixture.expectedPassed && fixture.expectedIssueType !== 'general';

      if (isFailedSpecific) {
        expect(result.rewrite, `${fixture.id} should expose a rewrite`).toBeDefined();
        expect(['prepend', 'append']).toContain(result.rewrite!.placement);
        expect(result.rewrite!.snippet.length).toBeGreaterThan(0);
      } else {
        expect(
          result.rewrite,
          `${fixture.id} (passed=${fixture.expectedPassed}, issue=${fixture.expectedIssueType}) should have no rewrite`,
        ).toBeUndefined();
      }
    }
  });
});

async function runBenchmarkCase(fixture: PromptReviewBenchmarkCase): Promise<BenchmarkRun> {
  const requests: LlmGenerateTextRequest[] = [];
  const llm = createFixtureLlmClient(fixture, requests);
  const ast = parsePrompt(fixture.prompt);
  const profile = getBuiltinProfile('gpt');
  const result = await llmPromptReviewRule.check({ ast, profile, llm });
  const request = requests[0];

  if (!request) {
    throw new Error(`Benchmark fixture ${fixture.id} did not call the LLM client.`);
  }

  return {
    fixture,
    request,
    result,
  };
}

function createFixtureLlmClient(
  fixture: PromptReviewBenchmarkCase,
  requests: LlmGenerateTextRequest[],
): LlmClient {
  return {
    provider: 'benchmark',
    model: 'fixture',
    async generateText(request) {
      requests.push(request);
      return {
        provider: 'benchmark',
        model: 'fixture',
        text: JSON.stringify(fixture.llmResponse),
      };
    },
  };
}

function containsEveryKeyword(value: string, keywords: string[]): boolean {
  const normalized = value.toLowerCase();
  return keywords.every((keyword) => normalized.includes(keyword.toLowerCase()));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
