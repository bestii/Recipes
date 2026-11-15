---
id: 6
title: Build the private recipes app
status: closed
labels: ["wayfinder:task"]
parent: 1
blocked_by: [2, 3, 4, 5]
assignee: bestii
created: 2026-11-15
---

## Question

Build the app to the decisions this map has closed.

This is the one non-decision ticket, carried by the map's Notes override: the effort ends at a running app. It becomes takeable only when tickets 002–005 are closed; until then it stays blocked, since each decision feeds it directly.

Scope, in broad strokes, sharpened by those tickets:

- Scaffold with Vite+ per ticket 005, React + TypeScript + Tailwind.
- Recipes as Markdown files under the app's recipe directory, with the fields ticket 002 settled, loaded at build time.
- A recipe list route and a per-recipe route, styled to the prototype ticket 003 approved.
- Tests at the bar ticket 004 set.
- Two or three real seed recipes so the app is usable on first load.
- A README covering dev, build, and the static-host rewrite rule the map's fog calls out.

Deliberately absent: authentication, any write path, images, search.

## Resolution

Built and verified on 2026-11-15. Two-axis code review run before the first commit; the fixes it forced are listed last.

- **Stack:** Vite+ 1.6.0 (`vp create vite -- --template react-ts`), React 19, TypeScript, Tailwind v4 via `@tailwindcss/vite`, React Router. App lives at the repo root.
- **Data:** `src/recipes/*.md`, loaded with `import.meta.glob(..., "?raw", "eager")`; parsing, validation and ordering in `src/lib/recipe.ts`; globbing plus `findRecipe` in `src/lib/recipes.ts`.
- **Routes:** `/` (A–Z list with derived counts), `/recipes/:slug` (ingredients, then tappable steps), unknown slug → "Recipe not found", any other path → "Page not found".
- **Checks:** `npm test` 14/14, `npm run check` clean, `npm run build` clean to `dist/` (no browser-compat warnings after replacing gray-matter with `yaml`).
- **Seed data:** Cacio e Pepe, Dal Tadka, Banana Bread.
- **README:** authoring rules, commands, and per-host SPA rewrite rules.

Review fixes applied:

- Parse errors now name the **file path**, not just the slug; slug derivation enforces lowercase kebab-case file names.
- Unknown frontmatter fields are rejected instead of silently ignored.
- Not-found is a real route, not a silent fall-through to the list.
- Pluralisation fixed in the derived count line; sort locale pinned to `en` for deterministic order.
- Dropped the `recipes` prop threading in favour of `findRecipe()`.
- Added the missing empty-body test, plus tests for unknown fields and bad file names.
- Formatter ignores `issues/`, `research/` and `.commandcode/`.
