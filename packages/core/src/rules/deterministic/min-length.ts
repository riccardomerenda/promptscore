import type { Rule } from '../types.js';

const MIN_WORDS = 20;

export const minLengthRule: Rule = {
  id: 'min-length',
  name: 'Minimum length',
  description: 'Prompts shorter than 20 words rarely give a model enough to work with.',
  category: 'specificity',
  defaultSeverity: 'warning',
  type: 'deterministic',
  check: ({ ast }) => {
    const wc = ast.metadata.wordCount;
    const passed = wc >= MIN_WORDS;
    const score = passed ? 100 : Math.round((wc / MIN_WORDS) * 100);
    return {
      ruleId: 'min-length',
      passed,
      score,
      message: passed
        ? `Prompt length (${wc} words) is sufficient.`
        : `Prompt is very short (${wc} words). Models need enough context to respond well.`,
      suggestion: passed
        ? undefined
        : 'Add more detail about what you want, why, and how the output should look.',
      severity: 'warning',
      category: 'specificity',
      weight: 1,
    };
  },
};
