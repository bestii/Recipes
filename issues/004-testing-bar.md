---
id: 4
title: How much testing the app carries
status: closed
labels: ["wayfinder:grilling"]
parent: 1
blocked_by: []
assignee: bestii
created: 2026-11-15
---

## Question

How much test coverage should this app carry, and is any of it enforced?

Vitest ships with Vite+, so the cost of the first tests is near zero; the cost is the ongoing discipline of keeping them green. The riskiest surface is the Markdown loader — frontmatter parsing, missing required fields, slug collisions — not the two presentational routes.

Decide:

- None, loader unit tests only, or loader plus component render tests.
- Whether tests run on a pre-commit hook, in CI, or only on demand.
- Whether the build fails or warns when a recipe file is invalid (overlaps the fog on the map; settle it here if the answer is testable).

## Resolution

**Loader unit tests only.** No component render tests, no pre-commit hook, no CI gate.

- 12 tests in `src/lib/recipe.test.ts`, run under the bundled Vitest via `vite-plus/test` (`npm test`).
- They cover the happy path, `1)` markers, wrapped step lines, trimming, and every rejection: missing frontmatter, missing title, missing/empty/non-string ingredients, prose before the first step, and no steps at all.
- **An invalid recipe file fails loudly**: `parseRecipe` throws a `RecipeError` prefixed with the file's slug at module load, so the app never half-renders and the message names the file to fix. This closes the map's malformed-file fog.
