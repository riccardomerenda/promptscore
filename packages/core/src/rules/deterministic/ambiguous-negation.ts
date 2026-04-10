import type { Rule } from '../types.js';

const NEGATION_PATTERN = /\b(?:don't|do not|never|avoid|shouldn't|should not|must not|mustn't)\b/gi;

export const ambiguousNegationRule: Rule = {
  id: 'ambiguous-negation',
  name: 'Ambiguous negative instructions',
  description: 'Negative instructions ("don\'t do X") are less effective than positive ones ("do Y").',
  category: 'clarity',
  defaultSeverity: 'info',
  type: 'deterministic',
  check: ({ ast }) => {
    const matches = ast.raw.match(NEGATION_PATTERN) ?? [];
    const wc = ast.metadata.wordCount || 1;
    const ratio = matches.length / wc;
    const passed = matches.length < 3 || ratio < 0.05;
    const score = passed ? 100 : Math.max(20, 100 - matches.length * 10);
    return {
      ruleId: 'ambiguous-negation',
      passed,
      score,
      message: passed
        ? `Negative instructions are used sparingly (${matches.length} found).`
        : `Heavy use of negative instructions (${matches.length} found). Models follow positive instructions more reliably.`,
      suggestion: passed
        ? undefined
        : 'Rewrite "don\'t do X" as "do Y instead". Tell the model what the desired behavior is.',
      severity: 'info',
      category: 'clarity',
      weight: 1,
    };
  },
};
