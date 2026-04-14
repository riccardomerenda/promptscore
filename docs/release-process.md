# Release Process

This repository is set up so that future work does not depend on chat memory.

## Sources of truth

- `package.json` is the source of truth for the current product version.
- `config/product-docs.json` is the source of truth for the shipped-product narrative used in the repo docs.
- `packages/cli/src/version.ts` and `packages/web/src/lib/version.ts` are generated artifacts synced from the root package version.

## Commands

- `npm run sync-release-version` updates the generated version modules after a version bump.
- `npm run sync:docs` regenerates the version-sensitive blocks in `README.md` and `ROADMAP.md` and verifies the generated version modules.
- `npm run check:docs-sync` fails if the generated docs blocks or version modules are out of sync.
- `npm run check:live-site` polls `promptscore.dev` until the live homepage exposes the current repo version and `/docs/` returns HTTP 200.
- `npm run version-packages` already runs the release version sync and docs sync as part of the Changesets flow.

## CI behavior

`.github/workflows/ci.yml` runs `npm run check:docs-sync`, so stale docs or version modules are caught on every push and pull request to `main`.

## Landing page deploy

- `promptscore.dev` is deployed through Cloudflare Pages connected directly to this GitHub repository.
- That means the landing-page deploy path lives in Cloudflare configuration, not in a GitHub Actions workflow inside this repository.
- The repository still owns the site source and static export build, but Cloudflare Pages owns the actual publish step and custom-domain serving.
- `.github/workflows/live-site-smoke.yml` verifies the live site after pushes to `main` and can also be run manually with `workflow_dispatch`.

## What still needs manual ownership

- Cloudflare Pages settings such as production branch, build command, output directory, and environment variables should be kept consistent with the repo, because they are managed outside version control unless explicitly documented elsewhere.
- Release notes, roadmap direction, and feature priorities still need human review even when the generated blocks are in sync.
