import type { Rule } from '../types.js';
import { referenceFor } from '../references.js';

const SOFT_MAX = 1500;
const HARD_MAX = 3000;

export const maxLengthRule: Rule = {
  id: 'max-length',
  name: 'Maximum length',
  description: 'Excessively long prompts often contain redundancy and dilute the model’s focus.',
  category: 'structure',
  defaultSeverity: 'info',
  type: 'deterministic',
  check: ({ ast }) => {
    const wc = ast.metadata.wordCount;
    let score = 100;
    if (wc > SOFT_MAX) {
      const over = Math.min(wc - SOFT_MAX, HARD_MAX - SOFT_MAX);
      score = Math.max(0, 100 - Math.round((over / (HARD_MAX - SOFT_MAX)) * 100));
    }
    const passed = wc <= SOFT_MAX;
    return {
      ruleId: 'max-length',
      passed,
      score,
      message: passed
        ? `Prompt length (${wc} words) is within a comfortable range.`
        : `Prompt is long (${wc} words). Consider trimming redundancy or splitting into smaller prompts.`,
      suggestion: passed
        ? undefined
        : 'Look for repeated instructions, bundled unrelated tasks, or sections that can be summarized.',
      reference: referenceFor('max-length'),
      severity: 'info',
      category: 'structure',
      weight: 1,
    };
  },
};
