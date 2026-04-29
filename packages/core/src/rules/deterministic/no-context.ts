import type { Rule } from '../types.js';
import { referenceFor } from '../references.js';

export const noContextRule: Rule = {
  id: 'no-context',
  name: 'Background context provided',
  description: 'Context helps the model understand the situation, audience, and constraints.',
  category: 'specificity',
  defaultSeverity: 'info',
  type: 'deterministic',
  check: ({ ast }) => {
    const passed = Boolean(ast.components.context) || ast.metadata.wordCount >= 80;
    return {
      ruleId: 'no-context',
      passed,
      score: passed ? 100 : 40,
      message: passed
        ? 'Prompt provides context or is detailed enough to imply it.'
        : 'No background context detected. The model may miss important situational cues.',
      suggestion: passed
        ? undefined
        : 'Explain the situation: who the user is, why they’re asking, and what the stakes are.',
      reference: referenceFor('no-context'),
      severity: 'info',
      category: 'specificity',
      weight: 1,
    };
  },
};
