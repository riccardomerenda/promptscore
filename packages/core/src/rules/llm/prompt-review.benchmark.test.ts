import { describe, expect, it } from 'vitest';
import type { LlmClient, LlmGenerateTextRequest } from '../../llm/types.js';
import { parsePrompt } from '../../parser/index.js';
import { getBuiltinProfile } from '../../profiles/builtin.js';
import type { RuleResult } from '../types.js';
import {
  promptReviewBenchmarkCases,
  type PromptReviewBenchmarkCase,
} from './prompt-review.fixtures.js';
import { llmPromptReviewRule } from './prompt-review.js';

interface BenchmarkRun {
  fixture: PromptReviewBenchmarkCase;
  request: LlmGenerateTextRequest;
  result: RuleResult;
}

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
        expect(result.suggestion, `${fixture.id} suggestion`).toBeDefined();
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
