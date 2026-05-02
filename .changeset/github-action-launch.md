---
'@promptscore/core': patch
'@promptscore/cli': patch
'@promptscore/web': patch
---

Official GitHub Action: ship a composite action at the repo root (`action.yml`) that wraps `@promptscore/cli analyze`, exits non-zero on findings that cross the configured `fail-on` threshold, and (when `format: markdown`) appends the rendered report to the GitHub Actions job summary. Inputs cover paths, profile, format, fail-on, config, rules, include-llm, cli-version, and node-version. A new `.github/workflows/action-smoke.yml` consumes the local action against `examples/good/` (must pass) and `examples/bad/` (must fail with `--fail-on warning`) to guard the contract on every relevant change. The `/docs/github-action` page, `docs/github-action.md`, README, install tabs (new "github action" tab on the homepage), and product narrative are updated together so the new integration is documented end to end.
