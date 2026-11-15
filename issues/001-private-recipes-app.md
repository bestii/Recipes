---
id: 1
title: Private recipes app
status: open
labels: ["wayfinder:map"]
parent: null
blocked_by: []
assignee: null
created: 2026-11-15
---

## Destination

A working, mobile-first personal recipes app in this repo: Markdown recipe files, a recipe list, and a per-recipe page showing ingredients and cooking steps, built with Vite+ / React / TypeScript / Tailwind as a static site deployed to the user's subdomain.

## Notes

- **Domain:** a single person's private recipe collection. No accounts, no sharing between people, no write path from the app. "Private" means unlisted, not authenticated.
- **This effort overrides wayfinder's planning default.** It carries execution: the map ends with a running app, not a handoff spec. Decision tickets clear the fog; the final ticket is the build.
- **Settled stack:** Vite+ (`vp`, VoidZero's unified toolchain — 1.0 stable since 2026-09-28), React, TypeScript, Tailwind. Static build to `dist/`. Host provides SPA rewrites (every path → `/index.html`).
- **Settled data decisions:** one Markdown file per recipe; ingredients are plain text lines; each recipe gets its own reloadable URL; recipes are authored in the repo and shipped with the build.
- **Sessions should consult:** `grilling` + `domain-modeling` by default; `prototype` for view design (ticket 003); `research` for Vite+ facts (ticket 005). Write `GLOSSARY.md` and ADRs only when terms or hard-to-reverse decisions actually crystallise.
- **Out of scope is settled at v1** — see the section below; do not graduate it.

## Decisions so far

- [A recipe's fields beyond ingredients and steps](002-recipe-fields.md): exactly title + ingredients + steps; the file name is the slug; the list sorts A–Z by title.
- [Recipe list and cooking view design](003-recipe-list-and-cooking-view-design.md): warm paper palette, one centred column, tappable steps that reset on reload.
- [How much testing the app carries](004-testing-bar.md): loader unit tests only (12, green), no hooks or CI; an invalid recipe throws at load, naming the file.
- [What Vite+ provides for React, Tailwind and raw Markdown](005-vite-plus-capabilities.md): Vite+ is stable 1.0 — scaffold `vp create vite -- --template react-ts`, Tailwind v4 Vite plugin, `import.meta.glob(..., '?raw', eager)`, `vp build` → `dist/` behind a host rewrite.
- [Build the private recipes app](006-build-the-private-recipes-app.md): shipped — list + recipe routes, Markdown loader with file-named errors, 14 tests, clean build; deployment left to the owner.

## Not yet specified

- The exact rewrite syntax the README must name, once the subdomain's static host is chosen. The rule itself is settled (every path → `/index.html`); only the host's spelling of it is open, and the README already lists the common ones.

## Out of scope

- In-app add/edit form and any persisted app state; recipes are files in the repo for v1.
- Authentication, accounts, or per-user data.
- Images, servings/scaling, timers, tags/categories, search or filtering.
- Importing/scraping recipes from a URL.
- PWA / offline install for kitchen use.
