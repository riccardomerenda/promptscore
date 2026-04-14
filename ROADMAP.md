# PromptScore Roadmap

PromptScore should become the default linting and policy layer for prompts: local-first for individual builders, CI-ready for product teams, and optionally hosted later for collaboration and governance.

## Product Direction

- Keep the core value simple: score and improve prompts before they reach a model.
- Stay local-first by default. Deterministic checks should remain fast, offline, and private.
- Teach, not just block. Every failing rule should explain why it matters and how to fix it.
- Build an open-core product. The CLI, core library, browser analyzer, and baseline rules should remain free.

## Product Boundaries

PromptScore is not trying to become a general agent platform, tracing tool, or full output-evaluation suite. Its main job is prompt quality, prompt policy, and prompt review before runtime. That focus is part of the product strategy.

## Current Baseline

<!-- generated:roadmap-baseline:start -->
As of April 14, 2026, PromptScore v0.4.0 includes:

- 12 deterministic rules
- model profiles for `_base`, `claude`, and `gpt`
- `@promptscore/core` for Node and browser usage
- `promptscore` CLI
- project config discovery and CLI policy controls
- directory and glob analysis with aggregate batch reporting
- a browser analyzer on `promptscore.dev`
- a first-class `/docs` section on `promptscore.dev`
- docs, examples, CI validation, and an automated Changesets-based release workflow

This is a real MVP. It is useful today, but it is still missing optional LLM-backed rules, richer browser workflows, editor integrations, suppression mechanics, and team collaboration.
<!-- generated:roadmap-baseline:end -->

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

Documentation is now a near-term product priority. PromptScore teaches users why prompts improve, so the docs experience is part of the product, not just a support artifact. The immediate goal is to make `promptscore.dev/docs` the canonical home for onboarding, workflow guides, reference pages, FAQ, and release notes.

<!-- generated:roadmap-release-plan:start -->
| Version | Window | Theme | Planned deliverables |
| --- | --- | --- | --- |
| `v0.1.x` | Shipped | Stabilize the MVP | Deterministic linting foundation, profiles, core library, CLI, browser analyzer, docs foundation, and release-ready validation workflows. |
| `v0.2.0` | Shipped | Configurable prompt linting | Project config discovery, CLI policy controls, and the first CI-friendly defaults for teams adopting PromptScore in repositories. |
| `v0.3.0` | Shipped | Batch workflows | Directory and glob analysis with aggregate batch reporting, shared release version syncing, and stronger changelog/release automation. |
| `v0.4.0` | Q4 2026 | Intelligent guidance | Optional LLM-backed rules behind explicit opt-in, provider configuration, reference-backed explanations, rewrite suggestions, benchmark fixtures, and regression tracking for false positives. |
| `v0.5.0` | Q1 2027 | Team beta | Hosted accounts, private workspaces, report history, shared policies, team review flows, cloud sync for reports, and early billing foundations. |
| `v1.0.0` | H1 2027 | Stable platform | Stable config format, stable JSON schema, stable core API, official editor integration, production-ready GitHub Action, hosted workspaces GA, and the first enterprise-ready governance features. |
<!-- generated:roadmap-release-plan:end -->

## What Each Release Should Mean

<!-- generated:roadmap-release-meaning:start -->
- `v0.1.x` made PromptScore trustworthy.
- `v0.2.0` made PromptScore configurable in real projects.
- `v0.3.0` makes PromptScore usable across repeat repository workflows.
- `v0.4.0` should make PromptScore smarter without losing its deterministic identity.
- `v0.5.0` should prove that a hosted collaboration layer adds real value.
- `v1.0.0` should signal stability, integrations, and long-term compatibility.
<!-- generated:roadmap-release-meaning:end -->

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

<!-- generated:roadmap-next-moves:start -->
- Keep docs, site copy, and changelogs aligned with the shipped version.
- Continue strengthening the release checklist, changelog discipline, and browser/CLI parity.
- Prioritize `v0.4.0` around optional LLM-backed rules, provider configuration, and reference-backed guidance before expanding into hosted features.
- Keep commercial details private until the hosted `v0.5` scope is real enough to announce confidently.
<!-- generated:roadmap-next-moves:end -->
