import type { Profile, ProfileRuleOverride } from './types.js';

type PartialProfile = Omit<Profile, 'rules' | 'bestPractices'> & {
  rules: Record<string, ProfileRuleOverride>;
  bestPractices: string[];
};

function mergeOverrides(
  base: ProfileRuleOverride | undefined,
  override: ProfileRuleOverride | undefined,
): ProfileRuleOverride {
  return {
    severity: override?.severity ?? base?.severity,
    weight: override?.weight ?? base?.weight,
    suggestion: override?.suggestion ?? base?.suggestion,
    reference: override?.reference ?? base?.reference,
    enabled: override?.enabled ?? base?.enabled,
  };
}

function mergeProfiles(base: Profile, child: PartialProfile): Profile {
  const ruleIds = new Set<string>([...Object.keys(base.rules), ...Object.keys(child.rules)]);
  const rules: Record<string, ProfileRuleOverride> = {};

  for (const ruleId of ruleIds) {
    rules[ruleId] = mergeOverrides(base.rules[ruleId], child.rules[ruleId]);
  }

  return {
    name: child.name,
    displayName: child.displayName,
    version: child.version ?? base.version,
    base: child.base,
    rules,
    bestPractices: [...base.bestPractices, ...child.bestPractices],
  };
}

const baseProfile: Profile = {
  name: '_base',
  displayName: 'Model-agnostic baseline',
  version: '2026-04',
  base: undefined,
  rules: {
    'min-length': {
      severity: 'warning',
      weight: 1,
    },
    'max-length': {
      severity: 'info',
      weight: 0.8,
    },
    'no-output-format': {
      severity: 'warning',
      weight: 1.2,
      suggestion:
        'Tell the model the exact format you want (JSON schema, bullet list, single sentence, etc.).',
    },
    'no-examples': {
      severity: 'warning',
      weight: 1,
      suggestion: 'Add 1–3 concrete examples showing the input and the expected output.',
    },
    'no-role': {
      severity: 'info',
      weight: 0.8,
    },
    'no-context': {
      severity: 'info',
      weight: 0.9,
    },
    'ambiguous-negation': {
      severity: 'info',
      weight: 0.8,
    },
    'no-constraints': {
      severity: 'info',
      weight: 0.9,
    },
    'all-caps-abuse': {
      severity: 'info',
      weight: 0.6,
    },
    'vague-instruction': {
      severity: 'warning',
      weight: 1.1,
    },
    'missing-task': {
      severity: 'error',
      weight: 2,
    },
    'no-structured-format': {
      severity: 'warning',
      weight: 1,
    },
  },
  bestPractices: [
    'Be explicit about the task — one clear instruction beats several vague ones.',
    'Include at least one concrete example when the output format matters.',
    "Prefer positive instructions ('do Y') over negative ones ('don't do X').",
    'Specify the exact output format the model should return.',
    'Break long prompts into labeled sections.',
  ],
};

const claudeOverrides: PartialProfile = {
  name: 'claude',
  displayName: 'Anthropic Claude',
  version: '2026-04',
  base: '_base',
  rules: {
    'no-output-format': {
      severity: 'warning',
      weight: 1.2,
      suggestion:
        'Claude responds well to XML-tagged output format instructions like <output_format>.',
      reference: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering',
    },
    'no-examples': {
      severity: 'warning',
      weight: 1.5,
      suggestion: 'Claude benefits significantly from 2–3 few-shot examples inside <example> tags.',
      reference:
        'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/multishot-prompting',
    },
    'no-structured-format': {
      severity: 'warning',
      weight: 1.3,
      suggestion: 'Claude handles XML tags particularly well for separating sections.',
      reference:
        'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/use-xml-tags',
    },
    'ambiguous-negation': {
      severity: 'warning',
      weight: 1.1,
      suggestion: 'Claude follows positive framings more reliably than negations.',
    },
  },
  bestPractices: [
    'Use XML tags to separate sections: <instructions>, <context>, <example>, <output_format>.',
    'Put the most important instructions at both the beginning and the end of the prompt.',
    "Use positive instructions ('do X') rather than negative ('don't do Y').",
    'Provide 2–3 examples of the expected output format.',
    'For long prompts, wrap each section in an XML tag so Claude can refer back to it.',
  ],
};

const gptOverrides: PartialProfile = {
  name: 'gpt',
  displayName: 'OpenAI GPT',
  version: '2026-04',
  base: '_base',
  rules: {
    'no-output-format': {
      severity: 'warning',
      weight: 1.3,
      suggestion:
        'GPT responds well to explicit format instructions — mention JSON schema or a numbered list if relevant.',
      reference: 'https://platform.openai.com/docs/guides/prompt-engineering',
    },
    'no-examples': {
      severity: 'warning',
      weight: 1.3,
      suggestion: 'Use a system + user pattern with few-shot examples to anchor GPT’s behavior.',
    },
    'no-structured-format': {
      severity: 'warning',
      weight: 1.1,
      suggestion: 'Markdown headers and numbered sections work well for GPT.',
    },
    'no-role': {
      severity: 'info',
      weight: 1,
      suggestion: 'GPT responds well when given an explicit persona via a system message.',
    },
  },
  bestPractices: [
    'Use a system message to set the persona and global instructions.',
    'Structure long prompts with markdown headers (## Context, ## Task, ## Output).',
    'For structured output, prefer JSON schema or response_format: json_object.',
    'Include a handful of few-shot examples if format matters.',
    'Be explicit about what the model should not do, but always pair with what it should do.',
  ],
};

export const builtinProfiles = {
  _base: baseProfile,
  claude: mergeProfiles(baseProfile, claudeOverrides),
  gpt: mergeProfiles(baseProfile, gptOverrides),
} as const satisfies Record<string, Profile>;

export type BuiltinProfileName = keyof typeof builtinProfiles;

export function getBuiltinProfile(name: BuiltinProfileName): Profile {
  return structuredClone(builtinProfiles[name]);
}
