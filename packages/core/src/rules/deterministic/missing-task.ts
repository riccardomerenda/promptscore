import type { Rule } from '../types.js';

export const missingTaskRule: Rule = {
  id: 'missing-task',
  name: 'Clear task or instruction',
  description: 'Every prompt should have an unambiguous instruction telling the model what to do.',
  category: 'clarity',
  defaultSeverity: 'error',
  type: 'deterministic',
  check: ({ ast }) => {
    const passed = Boolean(ast.components.task);
    return {
      ruleId: 'missing-task',
      passed,
      score: passed ? 100 : 0,
      message: passed
        ? 'A clear task is present.'
        : 'No explicit task detected. The model may not know what you want it to do.',
      suggestion: passed
        ? undefined
        : 'State the task explicitly: "Your task is to..." or "Please <verb> <object>".',
      severity: 'error',
      category: 'clarity',
      weight: 1.5,
    };
  },
};
