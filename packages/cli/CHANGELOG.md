# @promptscore/cli

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

### Minor Changes

- 87fe16e: Add directory and glob analysis with aggregate batch reporting.

### Patch Changes

- Updated dependencies [87fe16e]
  - @promptscore/core@0.3.0

## 0.2.0

### Minor Changes

- 9b110f9: Add project config discovery and CLI policy controls.

### Patch Changes

- Updated dependencies [9b110f9]
  - @promptscore/core@0.2.0
