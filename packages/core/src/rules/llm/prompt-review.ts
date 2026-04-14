import type { LlmRule } from '../types.js';

const REVIEW_INSTRUCTIONS = [
  'You are PromptScore, an LLM prompt reviewer.',
  'Review the prompt before execution and look for issues deterministic lint rules often miss.',
  'Focus on hidden ambiguity, missing grounding, conflicting instructions, unrealistic task framing, and unclear success criteria.',
  'Return only valid JSON with keys: passed (boolean), score (integer 0-100), message (string), suggestion (string).',
  'Keep message and suggestion concise and practical.',
].join(' ');

export const llmPromptReviewRule: LlmRule = {
  id: 'llm-prompt-review',
  name: 'LLM prompt review',
  description:
    'Use a configured LLM to catch hidden ambiguity, missing grounding, or conflicting instructions that deterministic rules may miss.',
  category: 'model-specific',
  defaultSeverity: 'info',
  type: 'llm',
  check: async ({ ast, profile, llm }) => {
    const completion = await llm.generateText({
      instructions: REVIEW_INSTRUCTIONS,
      input: buildReviewInput(ast.raw, profile),
      temperature: 0,
      maxOutputTokens: 400,
    });

    const parsed = parseReviewPayload(completion.text);
    const score = clampScore(parsed.score);
    const passed = typeof parsed.passed === 'boolean' ? parsed.passed : score >= 80;
    const message =
      typeof parsed.message === 'string' && parsed.message.trim()
        ? parsed.message.trim()
        : passed
          ? 'The LLM review did not find a material prompt-quality issue.'
          : 'The LLM review found a prompt-quality issue worth tightening.';
    const suggestion =
      typeof parsed.suggestion === 'string' && parsed.suggestion.trim()
        ? parsed.suggestion.trim()
        : passed
          ? undefined
          : 'Make the task, constraints, and success criteria more explicit for the target model.';

    return {
      ruleId: 'llm-prompt-review',
      passed,
      score,
      message,
      suggestion,
      severity: 'info',
      category: 'model-specific',
      weight: 1,
    };
  },
};

function buildReviewInput(
  prompt: string,
  profile: { name: string; displayName: string; bestPractices: string[] },
): string {
  const bestPractices =
    profile.bestPractices.length > 0
      ? profile.bestPractices.map((item) => `- ${item}`).join('\n')
      : '- No profile-specific best practices were provided.';

  return [
    `Profile name: ${profile.name}`,
    `Profile display name: ${profile.displayName}`,
    'Profile best practices:',
    bestPractices,
    '',
    'Prompt to review:',
    '"""',
    prompt,
    '"""',
  ].join('\n');
}

function parseReviewPayload(text: string): {
  passed?: boolean;
  score?: number;
  message?: string;
  suggestion?: string;
} {
  const normalized = stripMarkdownCodeFence(text).trim();
  const candidate = extractFirstJsonObject(normalized);
  if (!candidate) {
    throw new Error(`LLM review rule returned invalid JSON: ${text}`);
  }

  const parsed = JSON.parse(candidate) as Record<string, unknown>;
  return {
    passed: typeof parsed.passed === 'boolean' ? parsed.passed : undefined,
    score: typeof parsed.score === 'number' ? parsed.score : undefined,
    message: typeof parsed.message === 'string' ? parsed.message : undefined,
    suggestion: typeof parsed.suggestion === 'string' ? parsed.suggestion : undefined,
  };
}

function stripMarkdownCodeFence(value: string): string {
  const match = value.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return match?.[1] ?? value;
}

function extractFirstJsonObject(value: string): string | undefined {
  const start = value.indexOf('{');
  if (start === -1) return undefined;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < value.length; index += 1) {
    const char = value[index];
    if (char === undefined) continue;

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return value.slice(start, index + 1);
      }
    }
  }

  return undefined;
}

function clampScore(value: number | undefined): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 50;
  }
  return Math.max(0, Math.min(100, Math.round(value)));
}
