---
'@promptscore/core': minor
'@promptscore/cli': minor
'@promptscore/web': minor
---

Add the v0.4.0 foundation for opt-in LLM-backed rules.

- introduce configurable LLM client support in `@promptscore/core`
- add the first experimental `llm-prompt-review` rule behind explicit opt-in
- wire `promptscore analyze --llm` through project config and runtime client creation
- document the new config, privacy boundary, and browser/CLI behavior
