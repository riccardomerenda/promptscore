# PromptScore Roadmap

PromptScore should become the default linting and policy layer for prompts: local-first for individual builders, CI-ready for product teams, and optionally hosted later for collaboration and governance.

## Product Direction

- Keep the core value simple: score and improve prompts before they reach a model.
- Stay local-first by default. Deterministic checks should remain fast, offline, and private.
- Teach, not just block. Every failing rule should explain why it matters and how to fix it.
- Build an open-core product. The CLI, core library, browser analyzer, and baseline rules should remain free.

## Product Boundaries

PromptScore is not trying to become a general agent platform, tracing tool, or full output-evaluation suite. Its main job is prompt quality, prompt policy, and prompt review before runtime. That focus is part of the product strategy.

## Current Baseline: v0.1.0

As of April 10, 2026, PromptScore v0.1.0 includes:

- 12 deterministic rules
- model profiles for `_base`, `claude`, and `gpt`
- `@promptscore/core` for Node and browser usage
- `promptscore` CLI
- a browser analyzer on `promptscore.dev`
- docs, examples, and release-ready build/lint/typecheck/test workflows

This is a real MVP. It is useful today, but it is still missing config, batch workflows, editor integrations, suppression mechanics, and team collaboration.

## Versioning And Releases

- Use semantic versioning for all public packages and public product communication.
- Tag every release as `vX.Y.Z`. Examples: `v0.1.0`, `v0.2.0`, `v0.2.1`.
- Use prerelease tags for risky launches: `v0.2.0-alpha.1`, `v0.2.0-beta.1`, `v1.0.0-rc.1`.
- Ship a GitHub Release for every tag with release notes, migration notes, and the list of user-visible changes.
- Reserve patch releases for bug fixes, UX polish, docs, compatibility updates, and low-risk improvements.
- Use minor releases for new functionality, new rules, new integrations, and workflow expansions.
- Save major releases for compatibility commitments, config stability, and API guarantees.

## Release Workflow

- Stabilize work on `main`.
- Cut a version branch only if a release needs hardening.
- Update package versions, docs, and site copy.
- Tag the release with `vX.Y.Z`.
- Publish GitHub release notes.
- Publish npm packages for public package releases.
- Update `promptscore.dev` to reflect the shipped version.

## Release Plan

| Version | Window | Theme | Planned deliverables |
| --- | --- | --- | --- |
| `v0.1.x` | Q2 2026 | Stabilize the MVP | Browser analyzer polish, CLI ergonomics, docs cleanup, release hygiene, smoke tests, bug fixes, packaging alignment, and a retroactive `v0.1.0` tag on the current stable commit. |
| `v0.2.0` | Q2-Q3 2026 | Configurable prompt linting | Project config file, custom profile overrides, directory and glob analysis, richer markdown/json reporting, Gemini profile, GitHub Action, and CI-friendly policy thresholds. |
| `v0.3.0` | Q3 2026 | Workflow and review | Saved local reports, prompt-to-prompt diffing, suppressions and baselines, import/export flows in the browser, shareable report formats, and better examples/templates for common prompt patterns. |
| `v0.4.0` | Q4 2026 | Intelligent guidance | Optional LLM-backed rules behind explicit opt-in, provider configuration, reference-backed explanations, rewrite suggestions, benchmark fixtures, and regression tracking for false positives. |
| `v0.5.0` | Q1 2027 | Team beta | Hosted accounts, private workspaces, report history, shared policies, team review flows, cloud sync for reports, and early billing foundations. |
| `v1.0.0` | H1 2027 | Stable platform | Stable config format, stable JSON schema, stable core API, official editor integration, production-ready GitHub Action, hosted workspaces GA, and the first enterprise-ready governance features. |

## What Each Release Should Mean

- `v0.1.x` should make PromptScore trustworthy.
- `v0.2.0` should make PromptScore adoptable in real projects.
- `v0.3.0` should make PromptScore usable across repeat workflows.
- `v0.4.0` should make PromptScore smarter without losing its deterministic identity.
- `v0.5.0` should prove that a hosted collaboration layer adds real value.
- `v1.0.0` should signal stability, integrations, and long-term compatibility.

## Public Product Commitments

- Keep the local analysis experience free and open source.
- Keep deterministic prompt linting fast, private, and usable without external services.
- Introduce hosted collaboration features only when they add clear workflow value for teams.
- Share commercial details later, when the hosted product shape is real and stable enough to communicate responsibly.

## Release Gates

PromptScore should not declare `v1.0.0` until the following are true:

- the CLI output and JSON schema are stable
- the config format is documented and migration-safe
- the core API is stable enough for third-party integrations
- the browser and CLI produce aligned results
- the GitHub Action and at least one editor integration are production-ready
- false positives are tracked with benchmark prompts and regression coverage

## Immediate Next Moves

- Backfill the first public git tag as `v0.1.0`.
- Create a lightweight release checklist and changelog discipline.
- Prioritize `v0.2.0` around config, batch analysis, and GitHub workflow adoption before expanding into hosted features.
- Keep commercial details private until the hosted `v0.5` scope is real enough to announce confidently.
