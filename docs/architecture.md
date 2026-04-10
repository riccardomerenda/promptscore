# Architecture

PromptScore is a TypeScript monorepo with three packages and a pipeline that turns a raw prompt string into a scored report.

```
raw prompt  →  parser  →  PromptAST  →  rules engine  →  RuleResult[]  →  scorer  →  ScoreReport  →  reporter  →  text / json / markdown
                                           ↑
                                        profile
```

## Packages

- **`@promptscore/core`** — the library. Pure TypeScript, runs in Node and browser. Exposes `analyze`, `parsePrompt`, the rule registry, the profile loader, the scorer, and reporters.
- **`promptscore` (CLI)** — a thin `commander`-based wrapper around the core library.
- **`@promptscore/web`** — the landing page for [promptscore.dev](https://promptscore.dev). Static Next.js site with a browser analyzer powered by the deterministic core engine.

## Parser

The parser is heuristic. It uses keyword detection and structural pattern matching (XML tags, markdown headers, numbered sections) to split a prompt into semantic components: role, task, context, constraints, examples, output format, tone, fallback.

It does **not** need to be perfect. A reasonable best-effort parse is enough for the rules to produce useful feedback.

## Rules engine

Every rule implements the `Rule` interface and is registered in a `RuleRegistry`. The default registry is populated with the 12 deterministic rules that ship with v0.1.

Each rule receives a `RuleContext` — the `PromptAST` plus the active `Profile` — and returns a `RuleResult`. Results can be adjusted by the profile: severity, weight, suggestion, and reference can all be overridden per-model.

Rules come in two flavors:

- **`deterministic`** — fast, no external calls. All v0.1 rules.
- **`llm`** — planned for v0.2. Call an external LLM to evaluate a specific aspect of the prompt. They must opt in via `--llm`.

## Profiles

Profiles are YAML files under `profiles/`. A profile declares which rules apply with what severity and weight. Profiles can inherit from another via the `base:` field; the loader walks the chain and merges overrides.

```yaml
# profiles/claude.yaml
name: claude
base: _base
rules:
  no-examples:
    severity: warning
    weight: 1.5
    suggestion: "Claude benefits significantly from few-shot examples."
```

## Scorer

The scorer takes `RuleResult[]` and a profile and produces a `ScoreReport`:

- Each rule contributes a 0–100 score weighted by its profile weight.
- Rules are grouped by category; each category has a weighted-average score.
- The overall score is a weighted average of category scores.
- Suggestions are sorted by **impact**: `(100 − score) × weight × severityRank`.

## Reporter

The reporter formats a `ScoreReport` into:

- **text** — colored terminal output (default for CLI).
- **json** — machine-readable, stable shape.
- **markdown** — for docs, PRs, and future browser surfaces.

## Zero heavy dependencies

Core only depends on `yaml` for profile parsing. The CLI adds `commander`. That's it. The library is small, fast, and can run anywhere TypeScript can.
