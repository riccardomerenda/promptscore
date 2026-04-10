import type { Rule } from '../types.js';

export const noConstraintsRule: Rule = {
  id: 'no-constraints',
  name: 'Constraints defined',
  description: 'Explicit constraints keep the model on track and prevent scope drift.',
  category: 'specificity',
  defaultSeverity: 'info',
  type: 'deterministic',
  check: ({ ast }) => {
    const count = ast.components.constraints?.length ?? 0;
    const passed = count > 0;
    return {
      ruleId: 'no-constraints',
      passed,
      score: passed ? 100 : 0,
      message: passed
        ? `Prompt defines ${count} constraint${count === 1 ? '' : 's'}.`
        : 'No constraints detected. The model has no guardrails on length, scope, or style.',
      suggestion: passed
        ? undefined
        : 'Add constraints like length limits, scope boundaries, or things the answer must include.',
      severity: 'info',
      category: 'specificity',
      weight: 1,
    };
  },
};
