const RULES_DOCS = 'https://promptscore.dev/docs/rules';

export const RULE_REFERENCES: Record<string, string> = {
  'min-length': `${RULES_DOCS}#min-length`,
  'max-length': `${RULES_DOCS}#max-length`,
  'no-output-format': `${RULES_DOCS}#no-output-format`,
  'no-examples': `${RULES_DOCS}#no-examples`,
  'no-role': `${RULES_DOCS}#no-role`,
  'no-context': `${RULES_DOCS}#no-context`,
  'ambiguous-negation': `${RULES_DOCS}#ambiguous-negation`,
  'no-constraints': `${RULES_DOCS}#no-constraints`,
  'all-caps-abuse': `${RULES_DOCS}#all-caps-abuse`,
  'vague-instruction': `${RULES_DOCS}#vague-instruction`,
  'missing-task': `${RULES_DOCS}#missing-task`,
  'no-structured-format': `${RULES_DOCS}#no-structured-format`,
  'llm-prompt-review': `${RULES_DOCS}#llm-prompt-review`,
};

export function referenceFor(ruleId: string): string | undefined {
  return RULE_REFERENCES[ruleId];
}

export const LLM_ISSUE_REFERENCES: Record<string, string> = {
  ambiguity: `${RULES_DOCS}#llm-prompt-review-ambiguity`,
  conflict: `${RULES_DOCS}#llm-prompt-review-conflict`,
  grounding: `${RULES_DOCS}#llm-prompt-review-grounding`,
  'success-criteria': `${RULES_DOCS}#llm-prompt-review-success-criteria`,
  'task-framing': `${RULES_DOCS}#llm-prompt-review-task-framing`,
  general: `${RULES_DOCS}#llm-prompt-review`,
};
