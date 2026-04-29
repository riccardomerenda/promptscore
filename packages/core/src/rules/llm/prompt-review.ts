import type { LlmRule } from '../types.js';
import { LLM_ISSUE_REFERENCES, referenceFor } from '../references.js';

export type PromptReviewIssueType =
  | 'ambiguity'
  | 'conflict'
  | 'grounding'
  | 'success-criteria'
  | 'task-framing'
  | 'general';

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

const DEFAULT_SUGGESTIONS: Record<PromptReviewIssueType, string> = {
  ambiguity: 'Specify the task, input, audience, constraints, and expected output.',
  conflict: 'Choose one instruction path and remove the incompatible wording.',
  grounding: 'Provide source material, scope, assumptions, and uncertainty handling.',
  'success-criteria': 'State what a good answer must include, avoid, and optimize for.',
  'task-framing': 'Narrow the task to something the model can reasonably complete and verify.',
  general: 'Make the task, constraints, and success criteria more explicit for the target model.',
};

const REVIEW_INSTRUCTIONS = [
  'You are PromptScore, an LLM prompt reviewer.',
  'Review the prompt before execution and look for issues deterministic lint rules often miss.',
  'Focus on hidden ambiguity, missing grounding, conflicting instructions, unrealistic task framing, and unclear success criteria.',
  'Return only valid JSON with keys: passed (boolean), score (integer 0-100), issue_type (one of ambiguity, grounding, conflict, task-framing, success-criteria, general), message (string), suggestion (string).',
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
    const issueType = normalizeIssueType(parsed.issueType) ?? inferIssueType(parsed);
    const message =
      typeof parsed.message === 'string' && parsed.message.trim()
        ? formatIssueMessage(parsed.message.trim(), issueType, passed)
        : passed
          ? 'The LLM review did not find a material prompt-quality issue.'
          : formatIssueMessage(
              'The LLM review found a prompt-quality issue worth tightening.',
              issueType,
              false,
            );
    const suggestion =
      typeof parsed.suggestion === 'string' && parsed.suggestion.trim()
        ? formatIssueSuggestion(parsed.suggestion.trim(), issueType, passed)
        : passed
          ? undefined
          : `${ISSUE_ACTIONS[issueType]}: ${DEFAULT_SUGGESTIONS[issueType]}`;

    return {
      ruleId: 'llm-prompt-review',
      passed,
      score,
      message,
      suggestion,
      reference: passed
        ? referenceFor('llm-prompt-review')
        : (LLM_ISSUE_REFERENCES[issueType] ?? referenceFor('llm-prompt-review')),
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
  issueType?: string;
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
    issueType: readIssueType(parsed),
    message: typeof parsed.message === 'string' ? parsed.message : undefined,
    suggestion: typeof parsed.suggestion === 'string' ? parsed.suggestion : undefined,
  };
}

function readIssueType(parsed: Record<string, unknown>): string | undefined {
  const value = parsed.issue_type ?? parsed.issueType;
  return typeof value === 'string' ? value : undefined;
}

function normalizeIssueType(value: string | undefined): PromptReviewIssueType | undefined {
  const normalized = value?.trim().toLowerCase().replace(/_/g, '-');
  if (
    normalized === 'ambiguity' ||
    normalized === 'conflict' ||
    normalized === 'grounding' ||
    normalized === 'success-criteria' ||
    normalized === 'task-framing' ||
    normalized === 'general'
  ) {
    return normalized;
  }

  return undefined;
}

function inferIssueType(parsed: {
  message?: string;
  suggestion?: string;
  passed?: boolean;
}): PromptReviewIssueType {
  if (parsed.passed) return 'general';

  const text = `${parsed.message ?? ''} ${parsed.suggestion ?? ''}`.toLowerCase();
  if (text.includes('conflict') || text.includes('incompatible')) return 'conflict';
  if (text.includes('ground') || text.includes('source') || text.includes('jurisdiction')) {
    return 'grounding';
  }
  if (text.includes('success criteria') || text.includes('acceptance criteria')) {
    return 'success-criteria';
  }
  if (text.includes('unrealistic') || text.includes('overbroad') || text.includes('guarantee')) {
    return 'task-framing';
  }
  if (text.includes('ambiguous') || text.includes('vague') || text.includes('unclear')) {
    return 'ambiguity';
  }

  return 'general';
}

function formatIssueMessage(
  message: string,
  issueType: PromptReviewIssueType,
  passed: boolean,
): string {
  if (passed || issueType === 'general') return message;
  const label = ISSUE_LABELS[issueType];
  if (message.toLowerCase().startsWith(label.toLowerCase())) return message;
  return `${label}: ${message}`;
}

function formatIssueSuggestion(
  suggestion: string,
  issueType: PromptReviewIssueType,
  passed: boolean,
): string | undefined {
  if (passed) return undefined;
  if (issueType === 'general') return suggestion;

  const action = ISSUE_ACTIONS[issueType];
  if (suggestion.toLowerCase().startsWith(action.toLowerCase())) return suggestion;
  return `${action}: ${suggestion}`;
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
