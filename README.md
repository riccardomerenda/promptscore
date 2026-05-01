# PromptScore

**Static analysis for LLM prompts.** ESLint, but for prompts.

PromptScore analyzes a prompt *before* it is sent to a model and returns a score plus actionable feedback: what is missing, what is ambiguous, and what you could improve, with references to model-specific best practices.

> This is **not** an LLM evaluation framework. It does not measure output quality. It scores the *input* based on structural analysis and known prompt-engineering best practices.

---

## Why?

- Writing effective prompts is hard, and best practices keep changing.
- Most existing tools either rewrite your prompt as a black box or evaluate model outputs, which is a different problem.
- There is no widely adopted linter that gives you a score, flags issues, and teaches you why, the way ESLint does for JavaScript.

## Status

<!-- generated:product-status:start -->
PromptScore is in early development and the current shipped version is **v0.4.5**. The deterministic rules, library, CLI, profiles, docs, landing page, browser analyzer, project config discovery, directory and glob batch workflows, experimental opt-in LLM prompt review, reference-backed explanations on every rule result, and rewrite suggestions on supported deterministic rules are available today. stronger LLM regression fixtures, richer browser workflows, and more profiles are still on the roadmap.
<!-- generated:product-status:end -->

---

## Installation

```bash
# global
npm install -g @promptscore/cli

# or run once
npx @promptscore/cli analyze prompt.txt
```

## Published packages

PromptScore currently distributes public packages through npm.

| Package | Purpose | Canonical install |
| --- | --- | --- |
| [`@promptscore/cli`](https://www.npmjs.com/package/@promptscore/cli) | End-user CLI with the `promptscore` command | `npm install -g @promptscore/cli` |
| [`@promptscore/core`](https://www.npmjs.com/package/@promptscore/core) | Core analysis library for Node and browser integrations | `npm install @promptscore/core` |
| `@promptscore/web` | Static site package for `promptscore.dev` | Not published |

GitHub Releases are used for versioned release notes, but npm is the canonical package registry for installation. The repository's GitHub Packages tab may remain empty because PromptScore does not currently publish to GitHub Packages.

## Usage

```bash
# analyze a prompt from a file
promptscore analyze prompt.txt

# analyze with a specific model profile
promptscore analyze prompt.txt --model claude

# analyze a directory of prompt files
promptscore analyze prompts/

# analyze with a glob and emit aggregate JSON
promptscore analyze "prompts/**/*.{txt,md}" --format json

# analyze an inline prompt
promptscore analyze --inline "You are a helpful assistant. Answer questions."

# output as JSON
promptscore analyze prompt.txt --format json

# only run a subset of rules
promptscore analyze prompt.txt --rules no-examples,no-output-format

# use an explicit project config
promptscore analyze prompt.txt --config ./configs/team.yaml

# fail CI on warnings, not just errors
promptscore analyze prompts/ --fail-on warning

# list all rules and profiles
promptscore rules
promptscore profiles
```

### Example output

```text
PromptScore - profile: claude

Overall  62/100  [##################------------]
Score 62/100 - 1 error, 3 warnings, 2 info.

Categories
  clarity           70/100 (3 rules)
  structure         80/100 (2 rules)
  specificity       50/100 (3 rules)
  best-practice     45/100 (2 rules)

Findings
  error  missing-task  No explicit task detected.
         -> State the task explicitly: "Your task is to..."
  warn   no-examples   No examples provided.
         -> Add 1-3 concrete examples showing the input and the expected output.
  ...
```

---

## Programmatic use

```ts
import { analyze, format } from '@promptscore/core';

const report = await analyze(
  'You are a helpful assistant. Summarize articles.',
  { model: 'claude' },
);

console.log(format(report, 'text'));
console.log('Overall:', report.overall);
```

## Project config

PromptScore can auto-discover a project config file from the current directory or the analyzed file path. Supported names include `promptscore.config.yaml`, `promptscore.config.json`, and `.promptscorerc`.

```yaml
model: claude
format: markdown
rules:
  - missing-task
  - no-output-format
fail_on_severity: warning
profiles_dir: ./profiles
```

CLI flags override config values, so a project can default to `claude` while a one-off run still uses `--model gpt`.

When you pass a directory, PromptScore recursively analyzes `.txt`, `.md`, `.markdown`, and `.prompt` files while skipping common build folders like `node_modules`, `.git`, `dist`, and `.next`. Use a glob when you want custom file types or tighter control over the batch.

## Rules in the current public release

| Rule ID | Category | What it checks |
| --- | --- | --- |
| `min-length` | specificity | Prompt is not too short |
| `max-length` | structure | Prompt is not excessively long |
| `no-output-format` | specificity | Output format is specified |
| `no-examples` | best-practice | Few-shot examples are provided |
| `no-role` | best-practice | A role or persona is assigned |
| `no-context` | specificity | Background context is provided |
| `ambiguous-negation` | clarity | Prefer positive instructions over negations |
| `no-constraints` | specificity | Explicit constraints are defined |
| `all-caps-abuse` | clarity | ALL CAPS is not overused |
| `vague-instruction` | clarity | No vague qualifiers without definition |
| `missing-task` | clarity | An explicit task is detected |
| `no-structured-format` | structure | Long prompts use structural markers |

See [`docs/rules.md`](docs/rules.md) for details.

## Profiles

Profiles are YAML files under `profiles/` that configure which rules apply and with what weight for a specific model. PromptScore currently ships with:

- `_base` - the universal baseline
- `claude` - Anthropic Claude (extends `_base`)
- `gpt` - OpenAI GPT (extends `_base`)

## Project structure

```text
promptscore/
|-- packages/
|   |-- core/       # @promptscore/core - library
|   |-- cli/        # @promptscore/cli - CLI
|   `-- web/        # promptscore.dev - landing page
|-- profiles/       # YAML profiles
|-- examples/       # good and bad prompt examples
`-- docs/
```

## Development

```bash
git clone https://github.com/riccardomerenda/promptscore.git
cd promptscore
npm install
npm run build
npm run typecheck
npm test
```

Run the CLI locally:

```bash
node packages/cli/dist/index.js analyze examples/good/classifier.txt --model claude
node packages/cli/dist/index.js analyze examples/
```

## CI And Release Pipeline

PromptScore uses GitHub Actions plus Changesets for CI and releases.

- `.github/workflows/ci.yml` runs on pushes and pull requests to `main` across Node 18, 20, and 22. It installs dependencies, builds, lints, typechecks, tests, and runs `npm run format:check`.
- `.github/workflows/release.yml` runs on pushes to `main`. It uses `changesets/action` to either open or update a `Version Packages` PR, or publish packages when release changesets are present.
- `npm run version-packages` applies the version bump, updates changelogs, syncs the shared product version into the CLI and web app, and refreshes `package-lock.json`.
- After a successful publish, the release workflow creates a GitHub release tagged as `vX.Y.Z`.
- `packages/web` is a static Next.js export for `promptscore.dev`, but this repository does not currently include a GitHub Actions deploy workflow for the site itself.

For the repository-side automation and what to update manually, see [`docs/release-process.md`](docs/release-process.md).

## Roadmap

See [`ROADMAP.md`](ROADMAP.md) for the product direction, release plan, versioning policy, and public roadmap.

## Contributing

PRs welcome. See [`docs/contributing.md`](docs/contributing.md).

## License

MIT (c) Riccardo Merenda
