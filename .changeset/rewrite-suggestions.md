---
'@promptscore/core': patch
'@promptscore/cli': patch
'@promptscore/web': patch
---

Rewrite suggestions for deterministic rules: failing rules can now attach a concrete prepend/append snippet to the `RuleResult` via a new `rewrite?: PromptRewrite` field (`{ title, snippet, placement }`). Seven rules ship with rewrites today — `missing-task`, `no-role`, `no-context`, `min-length`, `no-output-format`, `no-examples`, `no-constraints`. The CLI text and markdown reporters render the snippet alongside the suggestion and reference, the browser analyzer surfaces it inline in each finding card, and the JSON output exposes the field verbatim so editor integrations and CI tooling can apply rewrites programmatically.
