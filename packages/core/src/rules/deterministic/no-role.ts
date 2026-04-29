import type { Rule } from '../types.js';
import { referenceFor } from '../references.js';

export const noRoleRule: Rule = {
  id: 'no-role',
  name: 'Role or persona assigned',
  description: 'Assigning a role focuses the model and sets expectations for expertise and tone.',
  category: 'best-practice',
  defaultSeverity: 'info',
  type: 'deterministic',
  check: ({ ast }) => {
    const passed = Boolean(ast.components.role);
    return {
      ruleId: 'no-role',
      passed,
      score: passed ? 100 : 0,
      message: passed
        ? 'A role or persona is assigned.'
        : 'No role assigned. Consider giving the model a persona aligned with the task.',
      suggestion: passed
        ? undefined
        : 'Start with something like "You are a senior <X> who specializes in <Y>."',
      reference: referenceFor('no-role'),
      severity: 'info',
      category: 'best-practice',
      weight: 1,
    };
  },
};
