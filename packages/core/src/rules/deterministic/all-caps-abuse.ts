import type { Rule } from '../types.js';

const CAPS_WORD_PATTERN = /\b[A-Z]{4,}\b/g;

export const allCapsAbuseRule: Rule = {
  id: 'all-caps-abuse',
  name: 'All-caps abuse',
  description: 'Excessive ALL CAPS is noisy and rarely the clearest way to emphasize something.',
  category: 'clarity',
  defaultSeverity: 'info',
  type: 'deterministic',
  check: ({ ast }) => {
    const caps = ast.raw.match(CAPS_WORD_PATTERN) ?? [];
    const wc = ast.metadata.wordCount || 1;
    const ratio = caps.length / wc;
    const passed = ratio < 0.05 && caps.length < 8;
    const score = passed ? 100 : Math.max(30, 100 - Math.round(ratio * 1000));
    return {
      ruleId: 'all-caps-abuse',
      passed,
      score,
      message: passed
        ? 'All-caps usage is within reasonable limits.'
        : `Excessive ALL CAPS (${caps.length} words). This rarely improves comprehension.`,
      suggestion: passed
        ? undefined
        : 'Use bold (**word**), quotes, or XML tags for emphasis instead of ALL CAPS.',
      severity: 'info',
      category: 'clarity',
      weight: 1,
    };
  },
};
