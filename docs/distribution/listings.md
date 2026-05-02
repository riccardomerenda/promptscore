# Distribution: listing submission text

Pre-drafted entries for awesome-* lists and similar curated indexes. The user submits the PRs at their own pace; this file just keeps the copy aligned with current PromptScore framing so the entries stay consistent.

## Awesome Prompt Engineering

Repository: <https://github.com/promptslab/Awesome-Prompt-Engineering> (or any active alternative).

Suggested entry under "Tools" or "Tools & Libraries":

```markdown
- [PromptScore](https://promptscore.dev) — Static analysis for LLM prompts. Twelve deterministic rules plus an opt-in LLM review, with rewrite snippets, profiles for Claude/GPT, a CLI, a browser analyzer, and an official GitHub Action. MIT, runs locally, no API calls. ([source](https://github.com/riccardomerenda/promptscore))
```

## Awesome LLM / Awesome LLMOps

For lists like <https://github.com/Hannibal046/Awesome-LLM> or <https://github.com/tensorchord/Awesome-LLMOps>.

Suggested entry under "Tools" / "Prompt Engineering":

```markdown
- [PromptScore](https://github.com/riccardomerenda/promptscore) — ESLint-style static analyzer for LLM prompts. CLI, browser analyzer, and GitHub Action. Scores prompts 0–100 with concrete fix suggestions and rewrite snippets, runs locally with no API calls.
```

## Awesome ChatGPT / Awesome AI Tools

For curated lists framed around ChatGPT / general AI tools.

```markdown
- **[PromptScore](https://promptscore.dev)** — Open-source linter for prompts. Catches ambiguity, missing context, conflicting instructions, and undefined success criteria before you send the prompt. CLI, browser analyzer, and GitHub Action. MIT.
```

## GitHub Action — Marketplace listing copy

When publishing the action.yml to the GitHub Actions Marketplace (manual one-time UI step), use:

**Name:** `PromptScore`

**Description (short):**
> Lint your prompts before they reach a model. Static analysis for LLM prompts in CI.

**Description (extended):**
> PromptScore is a composite GitHub Action that runs the open-source `@promptscore/cli` against the prompts in your repo. It scores each prompt 0–100, surfaces structural issues (missing task, no output format, conflicting instructions, vague qualifiers, missing grounding, etc.), and exits non-zero when findings cross your configured severity threshold. Renders a markdown report to the job summary so reviewers see findings inline in the GitHub UI. Runs entirely from npm with no external API calls unless the opt-in LLM review is enabled.

**Categories:** Code quality, Continuous integration

**Branding:** icon `check-square`, color `purple` (already set in action.yml).

## Show HN draft

Title: `Show HN: PromptScore – ESLint, but for LLM prompts`

Body:

```text
PromptScore is a static analyzer for LLM prompts. It does not call a model. It reads the prompt as text, scores it 0–100, and tells you what is structurally missing — missing task, no output format, conflicting instructions, undefined success criteria, vague qualifiers, etc. — with concrete fix suggestions and copy-pasteable rewrite snippets for the rules that can be deterministically rewritten.

The current release ships:
- 12 deterministic rules (fast, offline, no API calls)
- An opt-in LLM-backed review for issues deterministic rules miss (ambiguity, conflict, grounding, success criteria, task framing)
- Profiles for Claude and GPT (each tuning rule severity and weight)
- A CLI (`@promptscore/cli`) and a core library (`@promptscore/core`) for programmatic use
- A browser analyzer at promptscore.dev that runs the same engine in WASM-free TypeScript
- An official GitHub Action so you can lint prompts in CI with three lines of YAML

The project is MIT, runs entirely locally by default, and has no telemetry. The motivation is simple: writing prompts that other people depend on is becoming a real engineering task, and the feedback loop today is "ship and see what the model returns". Static analysis closes part of that loop the way ESLint did for JavaScript.

Repo: https://github.com/riccardomerenda/promptscore
Demo: https://promptscore.dev
Docs: https://promptscore.dev/docs

Happy to discuss design tradeoffs (deterministic vs. LLM-backed, scoring methodology, why no runtime evaluation), or pain points you want it to catch that it currently does not.
```

## Reddit / r/MachineLearning / r/LocalLLaMA

Title: `[Project] PromptScore — open-source static analyzer for LLM prompts (CLI + GitHub Action)`

Body: cut down version of the Show HN above, ~150 words, link the repo and the live demo.

## Notes

- Keep all entries factual to current shipped capability. If the LLM rule rewrites change shape in v0.5, refresh this file.
- For the Marketplace listing, the user has to publish manually from the GitHub UI on the repo's Releases page (one-time step).
- For Show HN, post in the morning Pacific Time on a weekday for best visibility.
