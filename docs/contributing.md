# Contributing

Thanks for your interest in improving PromptScore. This project is in early development — expect rough edges.

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

## Adding a rule

1. Create a new file under `packages/core/src/rules/deterministic/` (or `llm/` when that's ready).
2. Export a `Rule` const that implements the `Rule` interface from `../types.js`.
3. Register it in `packages/core/src/rules/deterministic/index.ts`.
4. Add a test case under `rules.test.ts`.
5. Document the rule in `docs/rules.md`.
6. If the rule has a strong model affinity, add weight/severity overrides to the relevant profile YAML.

## Adding a profile

1. Create `profiles/<name>.yaml`.
2. Set `base: _base` unless you have a good reason not to.
3. Override severity, weight, suggestion, or reference for any rule that matters for that model.
4. Add at least 3 `best_practices` bullet points.

## Commit style

Conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`.

## Code style

- TypeScript strict mode.
- Named exports only.
- `interface` over `type` for object shapes.
- Prefer pure functions; keep side effects at the edges (CLI, loader).
- Tests live next to source files.

## License

By contributing you agree that your contributions will be licensed under the MIT License.
