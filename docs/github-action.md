# GitHub Action

PromptScore ships an official GitHub Action so you can lint prompts in CI without writing custom workflow YAML. The Action is a composite that wraps `@promptscore/cli`: it installs Node, runs `npx @promptscore/cli analyze` against the paths you provide, and exits non-zero when findings cross the configured severity threshold.

## Quick start

```yaml
name: PromptScore

on:
  pull_request:
  push:
    branches: [main]

jobs:
  prompt-lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: riccardomerenda/promptscore@main
        with:
          inputs: prompts/
          model: claude
          format: markdown
          fail-on: warning
```

When `format: markdown` is set, the Action also appends the rendered report to the GitHub Actions job summary, so reviewers see findings inline in the GitHub UI.

## Inputs

| Input | Default | Description |
| --- | --- | --- |
| `inputs` | `prompts/` | Files, directories, or globs to analyze. Whitespace-separated for multiple paths. |
| `model` | `_base` | Profile name. Built-in: `_base`, `claude`, `gpt`. Custom profiles supported via project config. |
| `format` | `text` | Output format: `text`, `markdown`, or `json`. |
| `fail-on` | `error` | Severity threshold that fails the action: `error`, `warning`, `info`, or `none`. |
| `config` | — | Path to a PromptScore config file. Empty falls back to project discovery. |
| `rules` | — | Comma-separated rule IDs to include. Empty means all rules from the active profile. |
| `include-llm` | `false` | Run LLM-backed rules. Requires the relevant API key in the runner environment. |
| `cli-version` | `latest` | Version of `@promptscore/cli` to install. Pin to a specific version for reproducibility. |
| `node-version` | `20` | Node.js version to use on the runner. |

## Versioning

Reference `riccardomerenda/promptscore@main` to track the latest release, or pin to a specific tag (e.g. `@v0.4.8`) for full reproducibility. The action.yml contract is part of the package's public surface; breaking changes only land on a major version bump.

## What it does not do yet

- No inline PR annotations (review comments are not posted on individual prompt lines).
- No SARIF output, so findings do not appear in the GitHub Security tab.
- No npm install caching across runs.

These are reasonable next steps once the Action sees real usage; open an issue if any of them blocks you.
