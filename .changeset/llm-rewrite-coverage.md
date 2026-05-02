---
'@promptscore/core': patch
'@promptscore/cli': patch
'@promptscore/web': patch
---

Broader rewrite coverage: the opt-in `llm-prompt-review` rule now emits a per-issue rewrite snippet on its `RuleResult.rewrite` field for the five non-generic issue types (ambiguity, conflict, grounding, success-criteria, task-framing). Each snippet is a concrete prepend/append scaffold the user can paste into the prompt to address the failure mode the LLM identified. Pass results and the catch-all `general` issue keep `rewrite` undefined; the existing message and suggestion remain authoritative there. The `/docs/rules` page, repo docs, README/ROADMAP narrative, and homepage feature copy are updated to reflect that rewrites now span deterministic and LLM rules, and the benchmark suite now asserts every failed-non-general fixture surfaces a rewrite.
