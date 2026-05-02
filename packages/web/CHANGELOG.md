# @promptscore/web

## 0.4.7

### Patch Changes

- 4adc844: Broader rewrite coverage: the opt-in `llm-prompt-review` rule now emits a per-issue rewrite snippet on its `RuleResult.rewrite` field for the five non-generic issue types (ambiguity, conflict, grounding, success-criteria, task-framing). Each snippet is a concrete prepend/append scaffold the user can paste into the prompt to address the failure mode the LLM identified. Pass results and the catch-all `general` issue keep `rewrite` undefined; the existing message and suggestion remain authoritative there. The `/docs/rules` page, repo docs, README/ROADMAP narrative, and homepage feature copy are updated to reflect that rewrites now span deterministic and LLM rules, and the benchmark suite now asserts every failed-non-general fixture surfaces a rewrite.
- Updated dependencies [4adc844]
  - @promptscore/core@0.4.7

## 0.4.6

### Patch Changes

- 048274c: Stronger LLM regression fixtures for the `llm-prompt-review` rule path. The benchmark fixture set grew from 8 to 16 cases, with at least two fixtures per issue type (ambiguity, conflict, grounding, success-criteria, task-framing, general-pass) and broader domain coverage (code review, content writing, medical, data extraction, multi-issue prompts where the rule must pick the most blocking issue). Two new tests guard against silent coverage regressions: every issue type must keep at least two fixtures, and the fixture set must keep at least 12 cases mixing pass and fail outcomes. No engine or API changes — purely a regression-coverage expansion.
- Updated dependencies [048274c]
  - @promptscore/core@0.4.6

## 0.4.5

### Patch Changes

- 9078074: Align the product narrative with the shipped feature set. The README product-status block, ROADMAP baseline, and homepage feature copy now reflect that reference-backed explanations and rewrite suggestions are available today (not roadmap items), and the "Immediate Next Moves" line is scoped to what actually remains in the `v0.4.x` window — stronger LLM regression fixtures and broader rewrite coverage. No engine changes; this is a documentation and copy alignment patch.
- Updated dependencies [9078074]
  - @promptscore/core@0.4.5

## 0.4.4

### Patch Changes

- 9a52fb1: Rewrite suggestions for deterministic rules: failing rules can now attach a concrete prepend/append snippet to the `RuleResult` via a new `rewrite?: PromptRewrite` field (`{ title, snippet, placement }`). Seven rules ship with rewrites today — `missing-task`, `no-role`, `no-context`, `min-length`, `no-output-format`, `no-examples`, `no-constraints`. The CLI text and markdown reporters render the snippet alongside the suggestion and reference, the browser analyzer surfaces it inline in each finding card, and the JSON output exposes the field verbatim so editor integrations and CI tooling can apply rewrites programmatically.
- Updated dependencies [9a52fb1]
  - @promptscore/core@0.4.4

## 0.4.3

### Patch Changes

- bcb3447: Fix the release workflow so the auto-merge publish step reinstalls dependencies after checking out the merged "Version Packages" commit. The previous run lost `node_modules` during the post-merge checkout, which made `turbo` unavailable and aborted the npm publish step. With this fix, the auto-merge → publish path works end to end.
- Updated dependencies [bcb3447]
  - @promptscore/core@0.4.3

## 0.4.2

### Patch Changes

- 6531020: Reference-backed explanations: every rule result now carries a `reference` URL pointing to a stable anchor on `promptscore.dev/docs/rules`. The deterministic rules expose per-rule anchors (e.g. `#missing-task`), and the opt-in `llm-prompt-review` rule maps each issue type to its own anchor (e.g. `#llm-prompt-review-conflict`). The batch text and markdown reporters now render the reference alongside the suggestion, mirroring the single-file reporter. Profiles can still override the reference per rule.
- Updated dependencies [6531020]
  - @promptscore/core@0.4.2

## 0.4.1

### Patch Changes

- 12a2c15: Improve LLM prompt review guidance with normalized issue types and stronger regression coverage.
  - add structured `issue_type` handling for ambiguity, grounding, conflicts, task framing, success criteria, and general prompt quality
  - prefix failed LLM review messages and suggestions with issue-specific labels and actions
  - expand LLM benchmark fixtures with harder ambiguity and unrealistic task-framing cases

- Updated dependencies [12a2c15]
  - @promptscore/core@0.4.1

## 0.4.0

### Minor Changes

- d2d94a3: Add the v0.4.0 foundation for opt-in LLM-backed rules.
  - introduce configurable LLM client support in `@promptscore/core`
  - add the first experimental `llm-prompt-review` rule behind explicit opt-in
  - wire `promptscore analyze --llm` through project config and runtime client creation
  - document the new config, privacy boundary, and browser/CLI behavior

### Patch Changes

- Updated dependencies [d2d94a3]
  - @promptscore/core@0.4.0

## 0.3.0

### Patch Changes

- 87fe16e: Add directory and glob analysis with aggregate batch reporting.
- Updated dependencies [87fe16e]
  - @promptscore/core@0.3.0

## 0.2.0

### Minor Changes

- 9b110f9: Add project config discovery and CLI policy controls.

### Patch Changes

- Updated dependencies [9b110f9]
  - @promptscore/core@0.2.0
