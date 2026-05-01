# @promptscore/core

## 0.4.4

### Patch Changes

- 9a52fb1: Rewrite suggestions for deterministic rules: failing rules can now attach a concrete prepend/append snippet to the `RuleResult` via a new `rewrite?: PromptRewrite` field (`{ title, snippet, placement }`). Seven rules ship with rewrites today — `missing-task`, `no-role`, `no-context`, `min-length`, `no-output-format`, `no-examples`, `no-constraints`. The CLI text and markdown reporters render the snippet alongside the suggestion and reference, the browser analyzer surfaces it inline in each finding card, and the JSON output exposes the field verbatim so editor integrations and CI tooling can apply rewrites programmatically.

## 0.4.3

### Patch Changes

- bcb3447: Fix the release workflow so the auto-merge publish step reinstalls dependencies after checking out the merged "Version Packages" commit. The previous run lost `node_modules` during the post-merge checkout, which made `turbo` unavailable and aborted the npm publish step. With this fix, the auto-merge → publish path works end to end.

## 0.4.2

### Patch Changes

- 6531020: Reference-backed explanations: every rule result now carries a `reference` URL pointing to a stable anchor on `promptscore.dev/docs/rules`. The deterministic rules expose per-rule anchors (e.g. `#missing-task`), and the opt-in `llm-prompt-review` rule maps each issue type to its own anchor (e.g. `#llm-prompt-review-conflict`). The batch text and markdown reporters now render the reference alongside the suggestion, mirroring the single-file reporter. Profiles can still override the reference per rule.

## 0.4.1

### Patch Changes

- 12a2c15: Improve LLM prompt review guidance with normalized issue types and stronger regression coverage.
  - add structured `issue_type` handling for ambiguity, grounding, conflicts, task framing, success criteria, and general prompt quality
  - prefix failed LLM review messages and suggestions with issue-specific labels and actions
  - expand LLM benchmark fixtures with harder ambiguity and unrealistic task-framing cases

## 0.4.0

### Minor Changes

- d2d94a3: Add the v0.4.0 foundation for opt-in LLM-backed rules.
  - introduce configurable LLM client support in `@promptscore/core`
  - add the first experimental `llm-prompt-review` rule behind explicit opt-in
  - wire `promptscore analyze --llm` through project config and runtime client creation
  - document the new config, privacy boundary, and browser/CLI behavior

## 0.3.0

### Minor Changes

- 87fe16e: Add directory and glob analysis with aggregate batch reporting.

## 0.2.0

### Minor Changes

- 9b110f9: Add project config discovery and CLI policy controls.
