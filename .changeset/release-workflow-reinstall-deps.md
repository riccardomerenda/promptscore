---
'@promptscore/core': patch
'@promptscore/cli': patch
'@promptscore/web': patch
---

Fix the release workflow so the auto-merge publish step reinstalls dependencies after checking out the merged "Version Packages" commit. The previous run lost `node_modules` during the post-merge checkout, which made `turbo` unavailable and aborted the npm publish step. With this fix, the auto-merge → publish path works end to end.
