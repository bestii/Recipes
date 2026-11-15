---
id: 5
title: What Vite+ provides for React, Tailwind and raw Markdown
status: closed
labels: ["wayfinder:research"]
parent: 1
blocked_by: []
assignee: bestii
created: 2026-11-15
---

## Question

What exactly does Vite+ do for this project, against its current beta documentation?

Facts the build session will otherwise guess at:

- How to scaffold a React + TypeScript project with `vp`, and what the generated layout looks like.
- Whether `vp` replaces or sits beside npm/pnpm, and how the project pins its runtime and package manager.
- The supported Tailwind integration (v4 `@tailwindcss/vite` plugin vs PostCSS) and the exact install/config steps.
- How to import many Markdown files at build time — `import.meta.glob` with `?raw`, and whether Rolldown changes any of that behaviour.
- What `vp build` emits for static hosting, and the preview/dev commands.
- Beta caveats that would change the stack decision, or make plain Vite the safer call.

AFK ticket: resolve with a subagent that runs the `research` skill against Vite+'s own docs and repo, and capture the findings as `research/vite-plus-capabilities.md`. Link that file here; do not paste it into the body.

## Resolution

**The premise was stale: Vite+ is stable, not beta.** 1.0 shipped 2026-09-28 (MIT); npm `vite-plus@1.6.0` as of 2026-11-11, bundling Vite 8.3.7, Rolldown 1.2.18, Vitest 5.1.0, Oxlint 1.93.0. The stack decision stands — no fallback to plain Vite needed.

- **Scaffold:** install the global CLI on Windows with `irm https://vite.plus/ps1 | iex`, then `vp create vite -- --template react-ts`.
- **`vp` wraps the package manager**, it does not replace it; Node/PM are pinned via `.node-version` / `devEngines` and `vp env pin`.
- **Tailwind:** no Vite+ docs page exists, so use Tailwind v4's Vite plugin — `vp add -D tailwindcss @tailwindcss/vite`, `plugins: [tailwindcss()]` in a `vite.config.ts` whose `defineConfig` comes from `vite-plus`, `@import "tailwindcss";` in CSS.
- **Markdown:** `import.meta.glob('./recipes/*.md', { query: '?raw', import: 'default', eager: true })` is the documented pattern; Rolldown changes nothing; no native alternative.
- **Build:** `vp build` → `dist/`; the host must rewrite every path to `/index.html`. `vp preview` serves it locally.
- **Watch-outs:** import tests from `vite-plus/test`, not `vitest`; keep `vite`/`vitest` overrides aligned (`EOVERRIDE` trap); no nested lint/fmt configs; `tsconfig baseUrl` silently disables type-aware checks; Node must be `^22.18.0 || ^24.11.0 || >=26.0.0`.

Full findings with source URLs and ten UNCERTAIN items flagged for build time: [research/vite-plus-capabilities.md](../research/vite-plus-capabilities.md).
