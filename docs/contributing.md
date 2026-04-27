# Contributing

Thanks for your interest in improving PromptScore. This project is in early development, so expect rough edges.

## Setup

```bash
git clone https://github.com/riccardomerenda/promptscore.git
cd promptscore
npm install
npm run build
npm run typecheck
npm test
```

## Running the CLI locally

```bash
node packages/cli/dist/index.js analyze examples/good/classifier.txt --model claude
```

## Running LLM regression fixtures

```bash
npm run benchmark:llm
```

The benchmark uses mocked LLM responses and does not call an external provider. Run it when changing LLM-backed rules, prompt-review instructions, output parsing, or expected guidance quality.

## Adding a rule

1. Create a new file under `packages/core/src/rules/deterministic/` or `packages/core/src/rules/llm/`.
2. Export a `Rule` const that implements the `Rule` interface from `../types.js`, including the correct `type` discriminator.
3. Register the rule in the matching index file so the default registry can discover it.
4. Add a focused test next to the source file or in the relevant shared rule test file.
5. For `llm` rules, stub `LlmClient` in tests and cover structured output parsing plus failure paths.
6. Document the rule in `docs/rules.md`.
7. If the rule changes the public config or CLI workflow, update the relevant docs pages under `packages/web/src/app/docs/`.
8. If the rule has a strong model affinity, add weight or severity overrides to the relevant profile YAML.

## Adding a profile

1. Create `profiles/<name>.yaml`.
2. Set `base: _base` unless you have a good reason not to.
3. Override severity, weight, suggestion, or reference for any rule that matters for that model.
4. Add at least 3 `best_practices` bullet points.

## Commit style

Conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`.

## Changesets

- Add a changeset for user-visible changes by running `npm run changeset`.
- Keep `@promptscore/core`, `@promptscore/cli`, and `@promptscore/web` on the same release line.
- Do not hand-edit the generated version files for the site or CLI.

## Code style

- TypeScript strict mode.
- Named exports only.
- `interface` over `type` for object shapes.
- Prefer pure functions; keep side effects at the edges (CLI, loader).
- Tests live next to source files.

## License

By contributing you agree that your contributions will be licensed under the MIT License.
