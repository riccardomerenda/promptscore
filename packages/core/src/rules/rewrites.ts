import type { PromptRewrite } from './types.js';

/**
 * Per-rule rewrite snippets for the deterministic rules that can produce a
 * concrete prepend/append. Rules that cannot deterministically rewrite the
 * prompt (e.g. `max-length` would need summarization, `vague-instruction`
 * needs measurable criteria the user must supply) intentionally have no
 * entry here — their `rewrite` field stays undefined.
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
