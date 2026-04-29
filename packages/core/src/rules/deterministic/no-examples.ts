import type { Rule } from '../types.js';
import { referenceFor } from '../references.js';

export const noExamplesRule: Rule = {
  id: 'no-examples',
  name: 'Examples provided',
  description: 'Few-shot examples dramatically improve output quality and consistency.',
  category: 'best-practice',
  defaultSeverity: 'warning',
  type: 'deterministic',
  check: ({ ast }) => {
    const count = ast.components.examples?.length ?? 0;
    const passed = count > 0;
    return {
      ruleId: 'no-examples',
      passed,
      score: passed ? 100 : 0,
      message: passed
        ? `Prompt includes ${count} example${count === 1 ? '' : 's'}.`
        : 'No examples provided. Few-shot examples usually improve output quality.',
      suggestion: passed
        ? undefined
        : 'Add 1–3 concrete examples showing the input and the expected output.',
      reference: referenceFor('no-examples'),
      severity: 'warning',
      category: 'best-practice',
      weight: 1,
    };
  },
};
