# Rules catalog

The current tagged public release (`v0.3.0`) ships deterministic rules only. The `main` branch also contains an experimental opt-in foundation for LLM-backed rules that is aimed at the upcoming `v0.4.0` line.

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

## LLM regression fixtures

The LLM rule path has a deterministic benchmark harness that uses mocked model responses. It does not call an external provider. Run it before changing LLM rule prompts, parsing, score thresholds, or guidance copy:

```bash
npm run benchmark:llm
```

The fixture set checks expected pass/fail classification, score ranges, guidance keywords, and the request context sent to the configured LLM client.

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
