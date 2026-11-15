# Recipes

A private, mobile-first collection of my own recipes: one list, one page per recipe with
ingredients and cooking steps.

Built with [Vite+](https://viteplus.dev/) (Vite, Vitest, Oxlint and Oxfmt behind the `vp` CLI),
React, TypeScript and Tailwind CSS. The build is a static site — no server, no database, no login.

## Adding a recipe

Every Markdown file placed directly in `src/recipes/` is one recipe. The file name becomes the
URL, so `src/recipes/cacio-e-pepe.md` lives at `/recipes/cacio-e-pepe`. File names must be
lowercase kebab-case; nested folders are not read.

```markdown
---
title: Cacio e Pepe
ingredients:
  - 200 g spaghetti or tonnarelli
  - 80 g Pecorino Romano, finely grated
---

1. Boil the pasta in well-salted water.
2. Toast the cracked pepper in a dry pan.
```

- `title` is required and is what the list sorts by.
- `ingredients` is a required list of plain-text lines.
- Steps are a numbered list in the body. One line per step; a line that isn't numbered is
  joined onto the step above, so you can wrap long steps.
- Nothing else belongs in the frontmatter: any other field is rejected rather than ignored.

A recipe that breaks any of these fails loudly, naming the file, the moment the app loads.

## Development

```bash
npm install
npm run dev      # local dev server
npm test         # parser unit tests
npm run check    # format, lint and type-check
npm run build    # type-check, then build to dist/
npm run preview  # serve dist/ locally
```

All scripts call the project-local `vp`; no global CLI is required.

## Deploying

Upload `dist/` to any static host. Because each recipe has its own path, the host must serve
`index.html` for unknown paths (an SPA rewrite). Otherwise a direct load of or reload on
`/recipes/…` returns 404.

| Host             | Rule                                                                    |
| ---------------- | ----------------------------------------------------------------------- |
| Netlify          | `/* /index.html 200` in a `_redirects` file, or a `[[redirects]]` block |
| Vercel           | `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }` |
| Cloudflare Pages | Serve `index.html` as the 404 fallback                                  |
| nginx            | `try_files $uri /index.html;`                                           |
| Apache           | `FallbackResource /index.html`                                          |

## Layout

```
src/
  recipes/       one Markdown file per recipe (the data)
  lib/recipe.ts  parsing and validation (pure, unit-tested)
  lib/recipes.ts reads the Markdown at build time via import.meta.glob
  routes/        the list page and the recipe page
```

`issues/` and `research/` hold the wayfinding map this app was built from; they are not part
of the build.
