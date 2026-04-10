import type { Rule } from '../types.js';
import { minLengthRule } from './min-length.js';
import { maxLengthRule } from './max-length.js';
import { noOutputFormatRule } from './no-output-format.js';
import { noExamplesRule } from './no-examples.js';
import { noRoleRule } from './no-role.js';
import { noContextRule } from './no-context.js';
import { ambiguousNegationRule } from './ambiguous-negation.js';
import { noConstraintsRule } from './no-constraints.js';
import { allCapsAbuseRule } from './all-caps-abuse.js';
import { vagueInstructionRule } from './vague-instruction.js';
import { missingTaskRule } from './missing-task.js';
import { noStructuredFormatRule } from './no-structured-format.js';

export const deterministicRules: Rule[] = [
  minLengthRule,
  maxLengthRule,
  noOutputFormatRule,
  noExamplesRule,
  noRoleRule,
  noContextRule,
  ambiguousNegationRule,
  noConstraintsRule,
  allCapsAbuseRule,
  vagueInstructionRule,
  missingTaskRule,
  noStructuredFormatRule,
];

export {
  minLengthRule,
  maxLengthRule,
  noOutputFormatRule,
  noExamplesRule,
  noRoleRule,
  noContextRule,
  ambiguousNegationRule,
  noConstraintsRule,
  allCapsAbuseRule,
  vagueInstructionRule,
  missingTaskRule,
  noStructuredFormatRule,
};
