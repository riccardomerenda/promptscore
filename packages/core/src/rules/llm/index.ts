import type { Rule } from '../types.js';
import { llmPromptReviewRule } from './prompt-review.js';

export const llmRules: Rule[] = [llmPromptReviewRule];

export { llmPromptReviewRule };
