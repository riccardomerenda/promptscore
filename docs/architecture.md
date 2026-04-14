# Architecture

PromptScore is a TypeScript monorepo with three packages and a pipeline that turns a raw prompt string into a scored report.

```text
raw prompt -> parser -> PromptAST -> rules engine -> RuleResult[] -> scorer -> ScoreReport -> reporter -> text / json / markdown
                                    ^
                                  profile
```

## Packages

- **`@promptscore/core`** - the library. Pure TypeScript, runs in Node and browser. Exposes `analyze`, `parsePrompt`, the rule registry, the profile loader, the scorer, and reporters.
- **`@promptscore/cli`** - the published CLI package. It installs the `promptscore` terminal command as a thin `commander`-based wrapper around the core library.
- **`@promptscore/web`** - the landing page for [promptscore.dev](https://promptscore.dev). Static Next.js site with a browser analyzer that stays deterministic and local-first by default.

## Parser

The parser is heuristic. It uses keyword detection and structural pattern matching (XML tags, markdown headers, numbered sections) to split a prompt into semantic components: role, task, context, constraints, examples, output format, tone, and fallback.

It does **not** need to be perfect. A reasonable best-effort parse is enough for the rules to produce useful feedback.

## Rules engine

Every rule implements the `Rule` interface and is registered in a `RuleRegistry`. The default registry can contain both deterministic and LLM-backed rules, but the LLM-backed path is skipped unless analysis explicitly enables it and provides a configured client.

Each rule receives a `RuleContext` - the `PromptAST` plus the active `Profile` - and returns a `RuleResult`. Results can be adjusted by the profile: severity, weight, suggestion, and reference can all be overridden per model.

Rules come in two flavors:

- **`deterministic`** - fast, no external calls. This remains the default path across the CLI, core library, and browser analyzer.
- **`llm`** - experimental foundation for the upcoming `v0.4.0` line. These rules call an external LLM through an injected or configured client and must remain explicitly opt-in via `--llm` or `include_llm`.

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

- Each rule contributes a 0-100 score weighted by its profile weight.
- Rules are grouped by category; each category has a weighted-average score.
- The overall score is a weighted average of category scores.
- Suggestions are sorted by **impact**: `(100 - score) x weight x severityRank`.

## Reporter

The reporter formats a `ScoreReport` into:

- **text** - colored terminal output (default for CLI).
- **json** - machine-readable, stable shape.
- **markdown** - for docs, PRs, and future browser surfaces.

## Privacy boundary

PromptScore stays local-first unless you opt into the LLM rule path. Deterministic analysis never leaves the local runtime. LLM-backed rules should be surfaced clearly in product UX because they send prompt text to the configured provider.

## Zero heavy dependencies

Core only depends on `yaml` for profile parsing. The CLI adds `commander`. That's it. The library is small, fast, and can run anywhere TypeScript can.
