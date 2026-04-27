---
'@promptscore/core': patch
'@promptscore/cli': patch
'@promptscore/web': patch
---

Improve LLM prompt review guidance with normalized issue types and stronger regression coverage.

- add structured `issue_type` handling for ambiguity, grounding, conflicts, task framing, success criteria, and general prompt quality
- prefix failed LLM review messages and suggestions with issue-specific labels and actions
- expand LLM benchmark fixtures with harder ambiguity and unrealistic task-framing cases
