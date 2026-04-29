import type { Rule } from '../types.js';
import { referenceFor } from '../references.js';

const LONG_PROMPT_THRESHOLD = 100;

export const noStructuredFormatRule: Rule = {
  id: 'no-structured-format',
  name: 'Structured formatting',
  description:
    'Long prompts are easier for a model to follow when broken into sections (XML tags, headers, lists).',
  category: 'structure',
  defaultSeverity: 'warning',
  type: 'deterministic',
  check: ({ ast }) => {
    const wc = ast.metadata.wordCount;
    const structured = ast.metadata.hasStructuredFormat;
    const passed = wc < LONG_PROMPT_THRESHOLD || structured;
    const score = passed ? 100 : 40;
    return {
      ruleId: 'no-structured-format',
      passed,
      score,
      message: passed
        ? structured
          ? 'Prompt uses structured formatting.'
          : 'Prompt is short enough to not need structural formatting.'
        : `Long prompt (${wc} words) without structural markers like XML tags, headers, or numbered sections.`,
      suggestion: passed
        ? undefined
        : 'Split the prompt into labeled sections: <instructions>, <context>, <examples>, <output_format>.',
      reference: referenceFor('no-structured-format'),
      severity: 'warning',
      category: 'structure',
      weight: 1,
    };
  },
};
