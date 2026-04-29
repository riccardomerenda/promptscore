---
'@promptscore/core': patch
'@promptscore/cli': patch
'@promptscore/web': patch
---

Reference-backed explanations: every rule result now carries a `reference` URL pointing to a stable anchor on `promptscore.dev/docs/rules`. The deterministic rules expose per-rule anchors (e.g. `#missing-task`), and the opt-in `llm-prompt-review` rule maps each issue type to its own anchor (e.g. `#llm-prompt-review-conflict`). The batch text and markdown reporters now render the reference alongside the suggestion, mirroring the single-file reporter. Profiles can still override the reference per rule.
