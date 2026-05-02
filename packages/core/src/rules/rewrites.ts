import type { PromptRewrite } from './types.js';

/**
 * Per-rule rewrite snippets for the deterministic rules that can produce a
 * concrete prepend/append. Rules that cannot deterministically rewrite the
 * prompt (e.g. `max-length` would need summarization, `vague-instruction`
 * needs measurable criteria the user must supply) intentionally have no
 * entry here — their `rewrite` field stays undefined.
 *
 * Per-issue rewrite snippets for the `llm-prompt-review` rule live below in
 * `LLM_ISSUE_REWRITES`. The `general` issue type has no entry: it represents
 * either a clean pass or a generic failure with no single template that
 * fits, so the rule's existing message and suggestion remain authoritative.
 */
const REWRITES: Record<string, PromptRewrite> = {
  'missing-task': {
    title: 'Add an explicit task',
    placement: 'prepend',
    snippet: 'Your task is to <verb> <object>. Specifically: <what success looks like>.',
  },
  'no-role': {
    title: 'Assign a role',
    placement: 'prepend',
    snippet:
      'You are a senior <role> who specializes in <domain>. You write for <audience> and prioritize <quality bar>.',
  },
  'no-context': {
    title: 'Add a context block',
    placement: 'prepend',
    snippet:
      '<context>\n  Who is asking: <user>\n  Why they are asking: <motivation>\n  Constraints or stakes: <what cannot break>\n</context>',
  },
  'min-length': {
    title: 'Flesh out the prompt',
    placement: 'append',
    snippet:
      '<context>\n  <who is asking and why>\n</context>\n\n<instructions>\n  <what you want, step by step>\n</instructions>\n\n<output_format>\n  <exact shape of the answer>\n</output_format>',
  },
  'no-output-format': {
    title: 'Specify the output format',
    placement: 'append',
    snippet:
      '<output_format>\n  Return a <JSON object | bullet list | markdown table | single paragraph>.\n  Required fields / sections: <list>.\n  Do not include: <what to omit>.\n</output_format>',
  },
  'no-examples': {
    title: 'Add few-shot examples',
    placement: 'append',
    snippet:
      '<examples>\n  <example>\n    <input><sample input></input>\n    <output><expected output></output>\n  </example>\n  <example>\n    <input><sample input></input>\n    <output><expected output></output>\n  </example>\n</examples>',
  },
  'no-constraints': {
    title: 'Add explicit constraints',
    placement: 'append',
    snippet:
      '<constraints>\n  - Length: <e.g. ≤ 200 words>\n  - Scope: <what is in scope and what is not>\n  - Must include: <required elements>\n  - Must avoid: <forbidden elements>\n</constraints>',
  },
};

export function rewriteFor(ruleId: string): PromptRewrite | undefined {
  return REWRITES[ruleId];
}

const LLM_ISSUE_REWRITES: Record<string, PromptRewrite> = {
  ambiguity: {
    title: 'Make the ambiguous parts explicit',
    placement: 'append',
    snippet:
      '<inputs>\n  <input variable> = <where the data comes from>\n</inputs>\n\n<scope>\n  In scope: <what to consider>\n  Out of scope: <what to ignore>\n</scope>\n\n<expected_output>\n  Shape: <exact format>\n  Audience: <who is reading>\n</expected_output>',
  },
  conflict: {
    title: 'Pick one consistent set of instructions',
    placement: 'append',
    snippet:
      '<resolved_instructions>\n  Output format: <ONE choice — JSON | markdown | plain text>\n  Length: <ONE target — exact words / characters / sentences>\n  Tone: <ONE register — formal | casual | technical>\n</resolved_instructions>\n\nRemove any earlier wording that contradicts these resolved instructions.',
  },
  grounding: {
    title: 'Add the missing grounding',
    placement: 'append',
    snippet:
      '<grounding>\n  Sources: <attached docs, URLs, or {{variable}} placeholders>\n  Scope: <jurisdiction, time period, domain>\n  Assumptions: <what the model can take as given>\n  Uncertainty: If the source material is silent on a point, say "not stated in the provided material" rather than guessing.\n</grounding>',
  },
  'success-criteria': {
    title: 'Define measurable success criteria',
    placement: 'append',
    snippet:
      '<success_criteria>\n  A good answer must include: <required elements>\n  A good answer must avoid: <forbidden elements or patterns>\n  Optimize for: <one explicit metric — accuracy | brevity | citation density | etc.>\n</success_criteria>',
  },
  'task-framing': {
    title: 'Reframe the task into something verifiable',
    placement: 'prepend',
    snippet:
      'Narrow the task to a single deliverable: <one concrete output>.\nOut of scope: <items the model should not attempt>.\nA reviewer can verify success by checking: <one observable check>.',
  },
};

export function llmIssueRewriteFor(issueType: string): PromptRewrite | undefined {
  return LLM_ISSUE_REWRITES[issueType];
}
