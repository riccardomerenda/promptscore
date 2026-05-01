---
'@promptscore/core': patch
'@promptscore/cli': patch
'@promptscore/web': patch
---

Stronger LLM regression fixtures for the `llm-prompt-review` rule path. The benchmark fixture set grew from 8 to 16 cases, with at least two fixtures per issue type (ambiguity, conflict, grounding, success-criteria, task-framing, general-pass) and broader domain coverage (code review, content writing, medical, data extraction, multi-issue prompts where the rule must pick the most blocking issue). Two new tests guard against silent coverage regressions: every issue type must keep at least two fixtures, and the fixture set must keep at least 12 cases mixing pass and fail outcomes. No engine or API changes — purely a regression-coverage expansion.
