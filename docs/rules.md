# Rules catalog

The current public release (`v0.4.0`) ships deterministic rules plus an experimental opt-in LLM review rule. The deterministic rules stay local by default; the LLM rule path only runs when explicitly enabled and configured.

Every rule populates a `reference` URL on its `RuleResult`. The reference points to a stable anchor on [promptscore.dev/docs/rules](https://promptscore.dev/docs/rules) so users can read the rationale and fix guidance without leaving their flow. CLI text, markdown, and batch reporters render the reference next to the suggestion. Profiles can override `reference` per rule (the built-in `claude` and `gpt` profiles already point a few rules at upstream provider docs).

Each rule produces a `RuleResult`:

```ts
interface RuleResult {
  ruleId: string;
  passed: boolean;
  score: number; // 0-100
  message: string;
  suggestion?: string;
  reference?: string;
  severity: 'error' | 'warning' | 'info';
  category: 'clarity' | 'structure' | 'specificity' | 'best-practice' | 'model-specific';
  weight: number;
}
```

## Deterministic rules

### `min-length` - specificity
Flags prompts with fewer than 20 words. Short prompts rarely give the model enough to work with.

### `max-length` - structure
Flags prompts over 1500 words. Very long prompts tend to contain redundancy and dilute focus.

### `no-output-format` - specificity
Flags prompts that do not specify how the answer should be formatted (JSON, list, sentence, etc.).

### `no-examples` - best-practice
Flags prompts with no few-shot examples. Examples dramatically improve consistency.

### `no-role` - best-practice
Flags prompts with no assigned role or persona.

### `no-context` - specificity
Flags prompts with no background context. Exception: very long prompts are assumed to provide implicit context.

### `ambiguous-negation` - clarity
Flags heavy use of `don't`, `never`, `avoid`, etc. Positive instructions work better.

### `no-constraints` - specificity
Flags prompts that don't set any constraints (length, scope, style).

### `all-caps-abuse` - clarity
Flags excessive ALL-CAPS words. Use bold or XML tags for emphasis instead.

### `vague-instruction` - clarity
Flags vague qualifiers like `good`, `nice`, `proper`, `appropriate`.

### `missing-task` - clarity
Flags prompts with no detectable task. This is an `error` and the highest-weight rule.

### `no-structured-format` - structure
Flags long prompts (>100 words) that have no XML tags, markdown headers, or numbered sections.

## LLM-backed rules (experimental, opt-in)

These rules are skipped unless you enable `--llm` in the CLI or `include_llm: true` in project config and provide a configured LLM client.

### `llm-prompt-review` - model-specific
Uses a configured LLM to catch hidden ambiguity, missing grounding, conflicting instructions, unrealistic task framing, and unclear success criteria that deterministic rules may miss.

When the model reports a failure, PromptScore normalizes the review into one of these issue types:

- `ambiguity`
- `grounding`
- `conflict`
- `task-framing`
- `success-criteria`
- `general`

Failed messages and suggestions are prefixed with issue-specific labels, and the `reference` field on the result links to the matching anchor on `promptscore.dev/docs/rules` (e.g. `#llm-prompt-review-conflict`).

## LLM regression fixtures

The LLM rule path has a deterministic benchmark harness that uses mocked model responses. It does not call an external provider. Run it before changing LLM rule prompts, parsing, score thresholds, or guidance copy:

```bash
npm run benchmark:llm
```

The fixture set checks expected pass/fail classification, issue labels, score ranges, guidance keywords, and the request context sent to the configured LLM client.

## Writing your own rules

A rule is just an object implementing the `Rule` interface. Register it before calling `analyze`:

```ts
import { analyze, type Rule } from '@promptscore/core';

const myRule: Rule = {
  id: 'has-user-placeholder',
  name: 'Has user placeholder',
  description: 'Prompt should reference {{user_input}} somewhere.',
  category: 'structure',
  defaultSeverity: 'warning',
  type: 'deterministic',
  check: ({ ast }) => {
    const passed = ast.raw.includes('{{user_input}}');
    return {
      ruleId: 'has-user-placeholder',
      passed,
      score: passed ? 100 : 0,
      message: passed ? 'Found placeholder.' : 'Missing {{user_input}} placeholder.',
      severity: 'warning',
      category: 'structure',
      weight: 1,
    };
  },
};

const report = await analyze(prompt, { extraRules: [myRule] });
```
