# PromptScore

**Static analysis for LLM prompts.** ESLint, but for prompts.

PromptScore analyzes a prompt *before* it is sent to a model and returns a score plus actionable feedback — what's missing, what's ambiguous, and what you could improve — with references to model-specific best practices.

> This is **not** an LLM evaluation framework. It does not measure output quality. It scores the *input* based on structural analysis and known prompt-engineering best practices.

---

## Why?

- Writing effective prompts is hard, and best practices keep changing.
- Most existing tools either rewrite your prompt as a black box (no learning) or evaluate model outputs (a different problem).
- There is no widely adopted linter that gives you a score, flags issues, and teaches you why — the way ESLint does for JavaScript.

## Status

PromptScore is in early development (**v0.1 — MVP**). The deterministic rules and the CLI are ready; LLM-backed rules, more profiles, and the web UI are on the roadmap.

---

## Installation

```bash
# global
npm install -g promptscore

# or run once
npx promptscore analyze prompt.txt
```

## Usage

```bash
# analyze a prompt from a file
promptscore analyze prompt.txt

# analyze with a specific model profile
promptscore analyze prompt.txt --model claude

# analyze an inline prompt
promptscore analyze --inline "You are a helpful assistant. Answer questions."

# output as JSON
promptscore analyze prompt.txt --format json

# only run a subset of rules
promptscore analyze prompt.txt --rules no-examples,no-output-format

# list all rules and profiles
promptscore rules
promptscore profiles
```

### Example output

```
PromptScore — profile: claude

Overall  62/100  [██████████████████░░░░░░░░░░░░]
Score 62/100 — 1 error, 3 warnings, 2 info.

Categories
  clarity           70/100 (3 rules)
  structure         80/100 (2 rules)
  specificity       50/100 (3 rules)
  best-practice     45/100 (2 rules)

Findings
  error   missing-task  No explicit task detected.
           → State the task explicitly: "Your task is to..."
  warn    no-examples   No examples provided.
           → Add 1–3 concrete examples showing the input and the expected output.
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

## Rules (v0.1)

| Rule ID | Category | What it checks |
| --- | --- | --- |
| `min-length` | specificity | Prompt is not too short |
| `max-length` | structure | Prompt is not excessively long |
| `no-output-format` | specificity | Output format is specified |
| `no-examples` | best-practice | Few-shot examples are provided |
| `no-role` | best-practice | A role or persona is assigned |
| `no-context` | specificity | Background context is provided |
| `ambiguous-negation` | clarity | Positive instructions over negations |
| `no-constraints` | specificity | Explicit constraints are defined |
| `all-caps-abuse` | clarity | ALL CAPS is not overused |
| `vague-instruction` | clarity | No vague qualifiers without definition |
| `missing-task` | clarity | An explicit task is detected |
| `no-structured-format` | structure | Long prompts use structural markers |

See [`docs/rules.md`](docs/rules.md) for details.

## Profiles

Profiles are YAML files under `profiles/` that configure which rules apply and with what weight for a specific model. v0.1 ships with:

- `_base` — the universal baseline
- `claude` — Anthropic Claude (extends `_base`)
- `gpt` — OpenAI GPT (extends `_base`)

## Project structure

```
promptscore/
├── packages/
│   ├── core/       # @promptscore/core — library
│   ├── cli/        # promptscore — CLI
│   └── web/        # promptscore.dev — landing page
├── profiles/       # YAML profiles
├── examples/       # good and bad prompt examples
└── docs/
```

## Development

```bash
git clone https://github.com/riccardomerenda/promptscore.git
cd promptscore
npm install
npm run build
npm test
```

Run the CLI locally:

```bash
node packages/cli/dist/index.js analyze examples/good/classifier.txt --model claude
```

## Roadmap

- **v0.1** (now) — parser, 12 deterministic rules, CLI, profiles, docs.
- **v0.2** — LLM-backed rules (Anthropic first), Gemini profile, markdown reporter polish.
- **v0.3** — [promptscore.dev](https://promptscore.dev) web UI.
- **Later** — VS Code extension, hosted API, team features.

## Contributing

PRs welcome. See [`docs/contributing.md`](docs/contributing.md).

## License

MIT © Riccardo Merenda
