import type { Rule } from '../types.js';
import { referenceFor } from '../references.js';

export const noOutputFormatRule: Rule = {
  id: 'no-output-format',
  name: 'Output format specified',
  description: 'The prompt should tell the model exactly how to format its answer.',
  category: 'specificity',
  defaultSeverity: 'warning',
  type: 'deterministic',
  check: ({ ast }) => {
    const passed = Boolean(ast.components.outputFormat);
    return {
      ruleId: 'no-output-format',
      passed,
      score: passed ? 100 : 0,
      message: passed
        ? 'An output format is specified.'
        : 'No output format is specified. The model will guess what you want.',
      suggestion: passed
        ? undefined
        : 'State the exact format: JSON schema, bullet list, markdown table, single sentence, etc.',
      reference: referenceFor('no-output-format'),
      severity: 'warning',
      category: 'specificity',
      weight: 1,
    };
  },
};
