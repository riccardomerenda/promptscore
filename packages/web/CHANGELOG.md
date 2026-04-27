# @promptscore/web

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
