# Vite+ capabilities for a React + TypeScript static recipes app

Researched against primary sources (viteplus.dev docs, the `voidzero-dev/vite-plus` repo, the VoidZero
blog, npm) on **2026-11-15** for issue 005. Every claim below carries the URL it came from. Anything I
could not find in a primary source is marked **UNCERTAIN** and repeated in
[Uncertain / verify at build time](#uncertain--verify-at-build-time).

> **Premise correction (important for the ticket).** The ticket assumes Vite+ is "currently in beta as
> of 2026". It is not. Vite+ **1.0 shipped stable on 28 Sep 2026** ("Vite+ 1.0 is out, stable, MIT
> licensed" — https://voidzero.dev/posts/announcing-vite-plus-1-0), and the current published version is
> **`vite-plus@1.6.0`** (npm, "Published 4 days ago", version field `1.6.0` —
> https://www.npmjs.com/package/vite-plus; release PR `release: v1.6.0` merged 2026-11-11 —
> https://github.com/voidzero-dev/vite-plus/pull/3426). The beta was July 2026
> (https://voidzero.dev/posts/announcing-vite-plus-beta). Beta caveats still apply in the weaker sense of
> "1.x is growing and some features are explicitly not built yet" — see [Q6](#6-beta-caveats-version-and-incremental-adoption).

---

## Summary

- **Scaffold:** `vp create vite -- --template react-ts` (documented forwarding example) after installing
  the global CLI with `curl -fsSL https://vite.plus | bash` / `irm https://vite.plus/ps1 | iex`; built-in
  templates are `vite:monorepo`, `vite:application`, `vite:library`, `vite:generator`.
- **`vp` does not replace npm/pnpm.** It *wraps* the package manager your project declares
  (`packageManager` / `devEngines.packageManager` / lockfile) and manages Node via `.node-version` →
  `devEngines.runtime` → `engines.node` → `.nvmrc`. Pin with `vp env pin <node> <pm>`.
- **Tailwind:** Vite+ has **no Tailwind page** in its docs index, so use Tailwind's own Vite guide:
  `vp add -D tailwindcss @tailwindcss/vite`, `plugins: [tailwindcss()]` in `vite.config.ts` (importing
  `defineConfig` from `vite-plus`), and `@import "tailwindcss";` in CSS. PostCSS is the fallback, not the
  recommendation.
- **Markdown:** `import.meta.glob('./recipes/*.md', { query: '?raw', import: 'default' })` is exactly the
  documented Vite pattern (add `eager: true` for a small app). Rolldown changes none of it, and Vite+ has
  no native Markdown/glob alternative.
- **Build output:** `vp build` runs the stock Vite 8 + Rolldown production build → **`dist/`**
  (`dist/index.html`, `dist/assets/*.js|*.css`), overridable via `build.outDir`; `vp preview` serves it
  locally. The static host must be told to rewrite **every** path to `/index.html`.

---

## 1. Scaffolding a React + TypeScript project with Vite+

### Install `vp` first (global CLI)

```bash
# macOS / Linux
curl -fsSL https://vite.plus | bash
```

```powershell
# Windows
irm https://vite.plus/ps1 | iex
```

Source: https://viteplus.dev/guide/global-cli ("## Install"), also on
https://viteplus.dev/guide and https://github.com/voidzero-dev/vite-plus#readme. After installing, open a
new shell and run `vp help`. On Windows an alternative is `vp-setup.exe`
(https://setup.viteplus.dev) — the docs note it "is not yet code-signed".

### Scaffold commands

```bash
vp create                       # interactive picker
vp create vite:application      # built-in "new application" template
vp create vite -- --template react-ts   # forward flags to the Vite/create-vite template
```

Source: https://viteplus.dev/guide/create — the `--template react-ts` form is the guide's own example:

> Arguments after `--` are passed directly to the selected template. […] For example, you can forward Vite
> template selection like this:
> ```bash
> vp create vite -- --template react-ts
> ```

Without the global CLI (the docs call this `create-vite-plus`):

```bash
pnpm create vite-plus
npm create vite-plus@latest
# forward args: the first arg is the template, not the directory
pnpm create vite-plus vite:application --directory my-app
npm create vite-plus@latest -- vite:application --directory my-app
```

Without the global CLI, pinned to a release (recommended by the agent setup prompt on
https://viteplus.dev/):

```bash
pnpm dlx --package=vite-plus@1.6.0 vp create
npx   --package=vite-plus@1.6.0 vp create
```

### Templates that exist (documented)

- Built-in: `vite:monorepo`, `vite:application`, `vite:library`, `vite:generator` (generator is
  monorepo-only).
- Shorthand/community: `vite`, `@tanstack/start`, `svelte`, `next-app`, `nuxt`, `react-router`, `vue`;
  full package names (`create-vite`, `create-next-app`); remote `github:user/repo` or an https GitHub URL.
- `vp create --list` prints "the built-in templates and the common shorthand templates Vite+ recognizes".

Source: https://viteplus.dev/guide/create ("## Built-in Templates", "## Template Sources").

Note that only `monorepo` and `generator` are vendored inside the CLI repo
(https://github.com/voidzero-dev/vite-plus/tree/main/packages/cli/templates); `vite:application` resolves
through the Vite/create-vite template flow, which is why `-- --template react-ts` is the reliable React+TS
selector.

### Options (documented)

`--directory <dir>`, `--package-manager <pnpm|npm|yarn|bun>`, `--no-interactive`, `--git` / `--no-git`,
`--agent <name>` / `--no-agent`, `--editor <name>` / `--no-editor`, `--hooks` / `--no-hooks`,
`--approve-builds`, `--verbose`, `--list`. Source: https://viteplus.dev/guide/create ("## Options").

For this workspace use `--no-git --no-hooks` (it is not a git repo) and, if you want a reproducible
scaffold, `--package-manager pnpm`.

### Generated directory structure — **not documented**

viteplus.dev publishes **no** rendered directory tree for `vite:application`
(checked the whole page at https://viteplus.dev/guide/create and the full docs index at
https://viteplus.dev/llms.txt). **UNCERTAIN.** What *is* documented about what `vp create` produces:

- One `vite.config.ts` at the project root is the single config file: "Vite+ can be configured using a
  single `vite.config.ts` at the root of your project" with `import { defineConfig } from 'vite-plus';`
  and the blocks `plugins`, `test`, `lint`, `fmt`, `run`, `staged`.
  Source: https://github.com/voidzero-dev/vite-plus#readme and https://viteplus.dev/config/fmt.
- `vp create` turns on type-aware linting and type checking by default: "`vp create` and `vp migrate` enable
  both `typeAware` and `typeCheck` by default."
  Source: https://viteplus.dev/guide/check ("## Overview").
- The project gets a Node.js pin and a package-manager pin that `vp env` reads (see [Q2](#2-does-vp-replace-npm-pnpm-and-how-are-runtime--package-manager-pinned)).
- Optional agent/editor instruction files and a Git hook dispatcher (`.vite-hooks/`) only if you opt in.

Plan to run `vp create vite -- --template react-ts --no-git --no-hooks --no-interactive` and then record
the actual tree from disk rather than assuming create-vite's layout.

---

## 2. Does `vp` replace npm/pnpm? How are runtime and package manager pinned?

### It sits alongside, and wraps

VoidZero's own 1.0 announcement is explicit: Vite+ "is neither a framework, nor a package manager and
*definitely not a replacement for Vite*. Instead, Vite+ ties the tools you already use into one tested
stack with a single config file and a consistent set of commands."
Source: https://voidzero.dev/posts/announcing-vite-plus-1-0.

The npm README says: "Vite+ automatically wraps your package manager (pnpm, npm, Yarn, or Bun) based on
`packageManager` and lockfiles" — `vp add`, `vp remove`, `vp update`, `vp install`, `vp dedupe`,
`vp outdated`, `vp why`, `vp pm <command>`, etc.
Source: https://github.com/voidzero-dev/vite-plus#readme.

`vp install` / `vp add` / `vp remove` are documented as using "the project's selected package manager"
(https://viteplus.dev/guide/env). Calling `pnpm` directly still runs pnpm, and `vp env off` makes Vite+
prefer system tools (same page, "## Environment Modes").

### Package-manager selection order (documented)

1. Explicit command override
2. `VP_PACKAGE_MANAGER`
3. Top-level `packageManager`
4. `devEngines.packageManager`
5. Lockfile or manager-specific configuration
6. The named package manager's global default version
7. The named shim's latest release (Node's bundled version for `npm`)

Source: https://viteplus.dev/guide/env ("## Package-Manager Selection").

### Node.js selection order (documented)

Nearest directory wins, then within a directory: `.node-version` → `devEngines.runtime` →
`engines.node` → `.nvmrc`; otherwise the global default from `vp env default`, then latest LTS.
Source: https://viteplus.dev/guide/env ("## Node.js Selection").

### Pinning per project

```bash
vp env pin lts pnpm@10          # pin both components to exact versions
vp env pin 22.0.0 pnpm@10.18.0  # unqualified version = Node.js
vp env current                  # show the resolved env (add --json for automation)
vp env doctor                   # diagnostics when resolution goes wrong
vp toolchain                    # versions bundled with the project-local vite-plus
vp toolchain --global           # versions of the global install
```

`vp env pin` writes Node pins to the existing `.node-version` / `.nvmrc` if present, otherwise a
`devEngines` entry; package-manager pins go to the workspace-root `package.json` (`packageManager`).
Sources: https://viteplus.dev/guide/env ("### Manage") and
https://viteplus.dev/guide/global-cli ("## Use Both CLIs Together" for `vp toolchain`).

If pnpm also manages runtimes, the docs say to add to `pnpm-workspace.yaml` (pnpm 11+):

```yaml
runtimeOnFail: ignore
pmOnFail: ignore
```

Source: https://viteplus.dev/guide/env (tip "Using pnpm with Vite+ runtime management").

### Install / dev / build / preview commands

```bash
vp create     # scaffold
vp install    # install dependencies with the project's package manager
vp dev        # Vite dev server
vp check      # format + lint + type-check
vp test       # Vitest
vp build      # production app build
vp preview    # serve the production build locally
vp run <script>  # run a package.json script (or a task)
```

Source: https://viteplus.dev/guide ("## Quick Start", "### Core Commands"),
https://viteplus.dev/guide/build, https://viteplus.dev/guide/dev.

**Built-ins cannot be overridden.** "`vp dev` always starts the built-in Vite dev server / `vp build`
always runs the built-in Vite build"; to run your own `package.json` script use `vp run dev` /
`vp run build`. Sources: https://viteplus.dev/guide/build, https://viteplus.dev/guide/troubleshooting
("## `vp dev` or `vp build` does not run my script").

Recommended `package.json` scripts (so collaborators need no global CLI):

```json
{
  "scripts": {
    "dev": "vp dev",
    "check": "vp check",
    "test": "vp test",
    "build": "vp build"
  }
}
```

Source: https://viteplus.dev/guide/local-cli ("## Best Practices").

### Global vs project-local toolchain

- Global `vp` delegates dev/build/test/run to the project's installed `vite-plus` when present, otherwise
  it uses the globally installed toolchain (`vp toolchain` shows which). Package-manager and `vp env` /
  `vp upgrade` / `vp implode` commands always stay with the global CLI.
  Source: https://viteplus.dev/guide/global-cli ("## Use Both CLIs Together").
- The global CLI is also usable **without any project dependency** ("## Use It Without a Local Package").

---

## 3. Tailwind CSS integration

**Primary finding: viteplus.dev documents no Tailwind integration at all.** The complete docs index
(https://viteplus.dev/llms.txt) has no Tailwind page, and the Tailwind-related paths I probed return
nothing. What Vite+ *does* document is that the `plugins` array is standard Vite config:

> Configuration — Use standard Vite configuration in `vite.config.ts`. […] Use it for: plugins, aliases,
> `build`, `preview`, environment modes.

Source: https://viteplus.dev/guide/build ("## Configuration"); same wording in
https://viteplus.dev/guide/dev.

So: **use Tailwind v4's `@tailwindcss/vite` plugin**, exactly as Tailwind documents for Vite, but with
`defineConfig` from `vite-plus`.

### Steps (composed from Tailwind's Vite guide + Vite+'s config surface)

1. Install:

```bash
vp add -D tailwindcss @tailwindcss/vite
# without the global CLI: pnpm add -D … / npm install -D …
```

   Tailwind's install step is `npm install tailwindcss @tailwindcss/vite` —
   https://tailwindcss.com/docs/installation/using-vite. `vp add` is the Vite+ form
   (https://viteplus.dev/guide ("### Set Up a Project")).

2. Register the plugin in `vite.config.ts`, keeping every other block (`test`, `lint`, `fmt`) in the same
   file:

```ts
// vite.config.ts
import { defineConfig } from 'vite-plus';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  test: { /* … */ },
  lint: { options: { typeAware: true, typeCheck: true } },
});
```

   Tailwind's plugin snippet uses `import { defineConfig } from 'vite'` with
   `plugins: [tailwindcss()]` (https://tailwindcss.com/docs/installation/using-vite, step 3); Vite+ swaps
   only the `defineConfig` import (https://github.com/voidzero-dev/vite-plus#readme).

3. Import Tailwind from your CSS entry:

```css
@import "tailwindcss";
```

   Source: https://tailwindcss.com/docs/installation/using-vite (step 4). Tailwind v4 needs no
   `tailwind.config.js` for that guide's setup.

4. Dev/build as usual: `vp dev`, `vp build`, `vp preview`.

### Optional Vite+-specific optimisation: `lazyPlugins`

`vite.config.ts` is loaded for `vp lint`, `vp fmt`, editor tooling and other metadata-only commands, so
heavy plugin factories should be deferred:

```ts
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, lazyPlugins } from 'vite-plus';

export default defineConfig({
  plugins: lazyPlugins(() => [tailwindcss()]),
});
```

Source: https://viteplus.dev/guide/troubleshooting ("## Slow config loading caused by heavy plugins") —
note the caveat there that a dynamic `import()` of a *local* module does not help; import the plugin
package directly inside the callback.

### PostCSS alternative

Tailwind also ships a PostCSS path (`@tailwindcss/postcss` in `postcss.config.mjs` —
https://tailwindcss.com/docs/installation/using-postcss), and Vite applies a valid PostCSS config
automatically: "If the project contains valid PostCSS config […] it will be automatically applied to all
imported CSS" (https://vite.dev/guide/features, "### PostCSS"). It therefore *works* under `vp build`, but
it is the slower/legacy path and nothing in Vite+'s docs recommends it. **Recommendation: `@tailwindcss/vite`.**

### Oxfmt and Tailwind class sorting

The 1.6.0 release notes mention that the bundled Oxfmt bump "fixes Tailwind class sorting in several
layouts" (https://github.com/voidzero-dev/vite-plus/pull/3426), i.e. Oxfmt has some Tailwind class-sorting
behaviour. The option name/semantics are not in Vite+'s config docs. **UNCERTAIN** — check
https://oxc.rs/docs/guide/usage/formatter/config.html and `vp fmt --help` before relying on it.

---

## 4. Importing many Markdown files at build time

### The pattern is exactly the documented Vite one

```ts
const modules = import.meta.glob('./recipes/*.md', {
  query: '?raw',
  import: 'default',
});
// modules['./recipes/cacio-e-pepe.md']() -> Promise<string>
```

Source: https://vite.dev/guide/features — "#### Custom Queries" shows literally this shape:

```ts
const moduleStrings = import.meta.glob('./dir/*.svg', {
  query: '?raw',
  import: 'default',
})
```

For a small personal recipe app, eager is simpler and avoids one network round-trip per recipe:

```ts
const recipes = import.meta.glob('./recipes/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});
// { './recipes/cacio-e-pepe.md': '# Cacio e pepe\n…' }
```

Documented behaviour for `import: 'default'` + `eager`: Vite emits
`import { default as __vite_glob_0_0 } from './dir/bar.js'` per match
(https://vite.dev/guide/features — "#### Named Imports").

`?raw` as a query suffix is also documented independently: `import assetAsString from './shader.glsl?raw'`
as "Load assets as strings" (https://vite.dev/guide/features, "## Static Assets").

### Documented caveats that will bite a build session

- "This is a Vite-only feature and is not a web or ES standard."
- Patterns "must be either relative (start with `./`) or absolute (start with `/`, resolved relative to
  project root) or an alias path".
- Matching uses `tinyglobby`; negative patterns (`!**/draft.md`) and arrays of globs are supported.
- "all the arguments in the `import.meta.glob` must be **passed as literals**. You can NOT use variables or
  expressions in them."

Source: https://vite.dev/guide/features ("### Glob Import Caveats", "### Multiple Patterns",
"### Negative Patterns").

### Does Rolldown change any of it?

**No documented change.** Vite+ builds with Vite 8 + Rolldown: "Note that Vite+ uses Vite 8 and
[Rolldown] for builds" (https://viteplus.dev/guide/build), and Vite 8's own docs still document
`import.meta.glob` with the `query` / `import` / `eager` options in full, while noting Rolldown is used for
dependency pre-bundling ("The pre-bundling step is performed with Rolldown") and Oxc for TS/JSX transforms
(https://vite.dev/guide/features). Nothing in Vite 8's docs qualifies or removes glob import support.
Vite+ 1.6.0 bundles `vite 8.3.7` and `rolldown 1.2.18`
(https://github.com/voidzero-dev/vite-plus/pull/3426, "Bundled Versions").

Two practical consequences worth designing around (both are normal Vite behaviour, not Vite+ specific):

- Non-eager globs are split into separate chunks per match, so a raw `.md` import becomes its own asset
  chunk — fine, but for ~dozens of recipes eager is faster and simpler.
- `.md` is not in Vite's built-in asset type list, so `assetsInclude` is irrelevant for `?raw` (the query is
  what matters); if you later want a bare `import md from './x.md'` URL you would need `assetsInclude`.

### Is there a Vite+ native alternative?

**No.** Neither the docs index (https://viteplus.dev/llms.txt) nor any guide page mentions Markdown,
frontmatter, content collections, or a glob helper. `import.meta.glob` (+ your own frontmatter parser, or a
third-party Vite Markdown plugin registered in `plugins`) is the path. A frontmatter parser is your choice —
nothing in Vite+ documents one.

---

## 5. What `vp build` emits, and what the static host must be told

### Output

- `vp build` "runs the standard Vite production build through Vite+ … the build pipeline and configuration
  model are the same as Vite" (https://viteplus.dev/guide/build).
- Default output directory is **`dist`**: "By default, the build output will be placed at `dist`. You may
  deploy this `dist` folder to any of your preferred platforms", and "This location can be changed using
  `build.outDir`" (https://vite.dev/guide/static-deploy).
- Vite+'s own homepage shows the shape of the emission:
  `dist/index.html`, `dist/assets/index.css`, `dist/assets/index.js` (https://viteplus.dev/).
- Hashed filenames under `dist/assets/` are the Vite default; `vp build --watch` and `vp build --sourcemap`
  exist (https://viteplus.dev/guide/build, "## Usage").

### Local preview

```bash
vp build
vp preview
```

Source: https://viteplus.dev/guide/build ("## Preview"). Vite warns that "`vite preview` is intended for
previewing the build locally and not meant as a production server"
(https://vite.dev/guide/static-deploy).

### SPA fallback: who does it

- In dev and preview, Vite does it for you. `appType` defaults to `'spa'`: "include HTML middlewares and use
  SPA fallback. Configure sirv with single: true in preview"
  (https://vite.dev/config/shared-options, `appType`). So `vp preview` will serve `/recipes/cacio-e-pepe`
  from `index.html` locally.
- A static host will **not**. Nothing in Vite+ or Vite configures your host; the host needs an explicit
  rewrite/fallback rule that serves `index.html` for any route that is not a real file. Vite's deployment
  guide shows the canonical form for Firebase hosting:

```json
{
  "hosting": {
    "public": "dist",
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```

  Source: https://vite.dev/guide/static-deploy ("## Google Firebase"). The equivalent on other hosts is an
  SPA-fallback option or a `_redirects`-style rule (`/* /index.html 200` on Netlify/Cloudflare Pages) —
  check your host's own docs, since Vite+ does not document host config.

- Base path: a subdomain root is `base: '/'`, the default. Only a sub-path deployment needs
  `base: '/<sub>/'` (https://vite.dev/guide/static-deploy, "## GitHub Pages" step 1, and
  https://vite.dev/config/shared-options, `base`).
- There is no `404.html`/`_redirects` generation in `vp build`; `vp build` emits the standard Vite output
  only (https://viteplus.dev/guide/build).

Vite+ also advertises pairing with Nitro for deployment (https://viteplus.dev/), and first-class support on
Vercel/Netlify/Cloudflare — but **not** an SPA-rewrite generator or host config emitter. Assume you write
the rewrite rule by hand.

---

## 6. Beta caveats, version, and incremental adoption

### Version and dates

| Fact | Value | Source |
| --- | --- | --- |
| 1.0 stable released | **2026-09-28** | https://voidzero.dev/posts/announcing-vite-plus-1-0 ("SEP 28, 2026") |
| Beta announced | July 2026 | https://voidzero.dev/posts/announcing-vite-plus-beta |
| Current npm version | **`vite-plus@1.6.0`**, published ~2026-11-11 | https://www.npmjs.com/package/vite-plus; https://github.com/voidzero-dev/vite-plus/pull/3426 |
| Bundled in 1.6.0 | vite `8.3.7`, rolldown `1.2.18`, vitest `5.1.0`, oxlint `1.93.0`, oxfmt `0.78.0`, tsdown `0.23.4`, oxc-node `1.0.1` | https://github.com/voidzero-dev/vite-plus/pull/3426 ("Bundled Versions") |
| Node requirement (Vitest 5) | `^22.18.0 \|\| ^24.11.0 \|\| >=26.0.0` | https://viteplus.dev/guide/test; https://viteplus.dev/guide/migrate |
| Weekly downloads | ~5.5M (npm sidebar) / "about to reach two million" in the 1.0 post | https://www.npmjs.com/package/vite-plus |

### Caveats that matter for this app

1. **Not feature-complete.** "Vite+ reached 1.0 but is far from feature-complete. Functionality such as
   remote caching, deeper monorepo diagnostics, `vp release`, and `vp docs` are planned for future
   versions." (https://voidzero.dev/posts/announcing-vite-plus-1-0). Preview releases exist and are the
   way to try unreleased fixes (https://viteplus.dev/guide/upgrade).
2. **Fast-moving bundled tools can break a previously green build.** The 1.6.0 notes say the new
   Oxlint/Oxfmt "can flag code that passed before. If your CI runs `vp check`, run `vp check --fix
   --continue-on-error` after you upgrade" (https://github.com/voidzero-dev/vite-plus/pull/3426). Pin the
   `vite-plus` version in the manifest and upgrade deliberately.
3. **Vitest is bundled and repointed**, which brings module-identity subtleties: Vite+ ships overrides so
   `vite` resolves to `@voidzero-dev/vite-plus-core` and `vitest` is pinned to the bundled version; getting
   these wrong gives duplicate-Vitest behaviour ("separate mocks, `expect` instances, and runner state"),
   and with npm a mismatched direct `vite` dependency fails with `EOVERRIDE`
   (https://viteplus.dev/guide/local-cli, "## Manual Installation"). The internals are heavily patched
   (a ~2,600-line build that copies 11 `@vitest/*` packages and patches chunk/alias resolution —
   https://github.com/voidzero-dev/vite-plus/issues/1327), so bug reports about odd test behaviour are
   plausible.
4. **Nested `lint`/`fmt` configs are deliberately unsupported** in Vite+ mode; all lint/format settings must
   live in the root `vite.config.ts` (`lint.overrides` / `fmt.overrides` for per-file rules), and the team
   is still collecting feedback on whether to change that
   (https://viteplus.dev/guide/troubleshooting, "## Nested lint or format config is not applied").
5. **`baseUrl` breaks type-aware checks.** "The Oxlint type checker path powered by `tsgolint` does not
   support `baseUrl`"; if the fix-up fails, Vite+ skips `typeAware`/`typeCheck`
   (https://viteplus.dev/guide/troubleshooting). Keep `baseUrl` out of `tsconfig.json`; use `resolve.alias`.
6. **1.0 was a breaking upgrade from 0.3** (Vitest 5 semantics; tsdown 0.23 pack option renames) —
   https://viteplus.dev/guide/migrate. Migration is idempotent but "Most projects will require further
   manual adjustments" (https://viteplus.dev/guide/migrate).
7. **`vp preview` can misfire for frameworks that relocate build output** (e.g. SolidStart's
   `.output/server`). Not an issue for a plain SPA, but it shows preview delegates to framework plugins
   (https://github.com/voidzero-dev/vite-plus/issues/2416).
8. **Platform/install edges:** prebuilt binaries are published for specific targets only (Linux x64/arm64
   glibc, Windows x64/arm64, macOS x64/arm64, Linux musl); `vp-setup.exe` is not code-signed; Alpine needs
   `apk add libstdc++` (https://viteplus.dev/guide/global-cli).

### Is plain Vite the safer call?

For **this** app — a client-only SPA using stock Vite plugins — the Vite+ surface you would rely on
(`vp dev`, `vp build`, `plugins`, `import.meta.glob`) is documented as "the standard Vite" pipeline, so the
risk concentrates in the *tooling* (bundled lint/test/build versions moving, config living in one file,
nested config unsupported) rather than in the app build. The strongest counter-argument to plain Vite is
the opposite one: Vite+ is stable at 1.x, MIT, and reversible (below).

### Incremental adoption (documented paths)

- **Global CLI only** for runtime + package-manager management and `vp run`, with no project dependency at
  all: "The global installation is enough for runtime, package-manager, and task-runner workflows"
  (https://viteplus.dev/guide/global-cli, "## Use It Without a Local Package").
- **Add the project-local CLI later**; the global CLI then delegates to it for dev/build/test/run
  (https://viteplus.dev/guide/global-cli, "## Use Both CLIs Together").
- **Adopt in an existing Vite project** with `vp migrate` (needs Vite 7+ and Vitest 4+ first), and keep
  your plugins and package manager: "No lock-in. Continue using your favorite Vite plugins and package
  manager" (https://voidzero.dev/posts/announcing-vite-plus-1-0; https://viteplus.dev/guide/migrate).
- Opt out of runtime management at any time with `vp env off` (scoped: `vp env off node` / `vp env off pm`)
  or bypass the shims with `VP_BYPASS`; remove the global install with `vp implode`
  (https://viteplus.dev/guide/env, https://viteplus.dev/guide/implode).
- Reverting to plain Vite is a manifest edit: drop `vite-plus`, drop the `vite`/`vitest` overrides, and
  restore `vite`-based scripts. (Inference from the install/override instructions in
  https://viteplus.dev/guide/local-cli — not documented as a named procedure.)

---

## 7. Testing (Vitest) and lint/format (Oxlint/Oxfmt) — what the build session must know

### Vitest ships inside the toolchain

- Import test APIs from `vite-plus/test`, not `vitest`:

```ts
import { describe, expect, it, vi } from 'vite-plus/test';
```

  "a single `vite-plus` install is enough — you do not need to install `vitest` directly."
  Source: https://viteplus.dev/guide/test.

- Test config goes in the **`test` block of `vite.config.ts`**: "Put test configuration directly in the
  `test` block in `vite.config.ts` so all your configuration stays in one place. We do not recommend using
  `vitest.config.ts` with Vite+." Source: https://viteplus.dev/guide/test ("## Configuration").
- **`vp test` does not default to watch mode** (unlike bare Vitest): "Unlike Vitest on its own, `vp test`
  does not stay in watch mode by default. Use `vp test watch`". Source: https://viteplus.dev/guide/test.
- `vp test` resolves Vitest from `vite-plus` dependencies first, then from the project; Vitest is `5.1.0`
  and requires Node `^22.18.0 || ^24.11.0 || >=26.0.0` (https://viteplus.dev/guide/test).
- DOM environments are optional peers, not bundled: the bundling breakdown lists `jsdom` and `happy-dom` as
  optional peer dependencies you install yourself
  (https://github.com/voidzero-dev/vite-plus/issues/1327, "3b. Peer/Optional Dependencies"). So a React DOM
  test needs `jsdom`/`happy-dom` + `@testing-library/react` added, plus `test.environment`.
  (The Vite+ docs do not show a React testing example — treat the exact config as **UNCERTAIN**.)
- Browser mode: `vite-plus/test/browser*` subpaths; Playwright/WebDriverIO providers are opt-in packages
  (https://viteplus.dev/guide/migrate, "### Vitest").

### Lint + format: one command, one config block each

```bash
vp check                    # format + lint (+ type-check when enabled)
vp check --fix              # format + apply autofixes
vp check --continue-on-error
vp check --no-fmt | --no-lint   # --no-fmt --no-lint = type-check only
```

Source: https://viteplus.dev/guide/check ("## Usage").

- `vp check` = Oxfmt (format) + Oxlint (lint) + `tsgolint`/tsgo (type check); "750+ ESLint compatible rules"
  and "Prettier compatible formatting" on https://viteplus.dev/.
- **Type-checking only runs if you enable it** in the `lint` block:

```ts
import { defineConfig } from 'vite-plus';

export default defineConfig({
  lint: { options: { typeAware: true, typeCheck: true } },
});
```

  Source: https://viteplus.dev/guide/check ("## Configuration"); `vp create`/`vp migrate` enable both.
- Order matters: "If formatting fails, `vp check` stops before lint and type checks run."
  Source: https://viteplus.dev/guide/check.
- Format settings live in the `fmt` block: `ignorePatterns`, `singleQuote`, `semi`, `sortPackageJson`, plus
  `fmt.overrides` for per-file settings; `vp fmt -c <path>` selects another config
  (https://viteplus.dev/config/fmt). Lint settings in the `lint` block
  (https://viteplus.dev/guide/lint).
- A step can be disabled project-wide via the `check` block, e.g. `check: { fmt: false }` — note that also
  affects pre-commit hooks (https://viteplus.dev/guide/check, "### Disabling a step by default").
- Do **not** add ESLint/Prettier: `vp migrate` rewrites `eslint`→`vp lint` and `prettier`→`vp fmt`
  (https://viteplus.dev/guide/migrate-rules, "## Package Script Rewrite Rules").

### Git-hook features are irrelevant here (no git repo)

`vp create --hooks` / `vp config` / `vp staged` / `.vite-hooks/pre-commit` only matter in a git repository
(https://viteplus.dev/guide/commit-hooks, https://viteplus.dev/guide/troubleshooting). Since
`C:\codebase\Recipe` is not a git repo, scaffold with `--no-git --no-hooks` and skip `staged` config.

---

## Sources

Primary (VoidZero / Vite / Tailwind):

- https://viteplus.dev/ — homepage (claims, `vp build` output sample, deploy-with-Nitro)
- https://viteplus.dev/llms.txt — full docs index (used to prove no Tailwind/Markdown page exists)
- https://viteplus.dev/guide — Getting Started / Quick Start / Core Commands
- https://viteplus.dev/guide/global-cli — install, env-var reference, "Use Without a Local Package", "Use Both CLIs Together"
- https://viteplus.dev/guide/local-cli — project-local package, manual install + overrides, best practices
- https://viteplus.dev/guide/create — `vp create`, templates, options, `-- --template react-ts`
- https://viteplus.dev/guide/migrate — migration flow, Node requirement, upgrade from 0.3
- https://viteplus.dev/guide/migrate-rules — script/config rewrite rules, dependency rules
- https://viteplus.dev/guide/env — Node + package-manager selection/pinning, `vp env` commands
- https://viteplus.dev/guide/dev — `vp dev` is standard Vite dev server
- https://viteplus.dev/guide/build — `vp build` is standard Vite build (Vite 8 + Rolldown), `vp preview`
- https://viteplus.dev/guide/check — format+lint+typecheck, `typeAware`/`typeCheck`, flags
- https://viteplus.dev/guide/test — Vitest via `vite-plus/test`, `test` block, no default watch
- https://viteplus.dev/config/fmt — `fmt` block reference
- https://viteplus.dev/guide/troubleshooting — `lazyPlugins`, baseUrl/tsgolint, nested configs, built-ins vs scripts
- https://voidzero.dev/posts/announcing-vite-plus-1-0 — 1.0 GA, date, "not a replacement for Vite", what's next, no lock-in
- https://voidzero.dev/posts/announcing-vite-plus-beta — beta timeline
- https://github.com/voidzero-dev/vite-plus — README (single `vite.config.ts`, config example, CLI list, PM wrapping)
- https://raw.githubusercontent.com/voidzero-dev/vite-plus/main/README.md — same, raw
- https://www.npmjs.com/package/vite-plus — version `1.6.0`, publish date, downloads
- https://github.com/voidzero-dev/vite-plus/pull/3426 — v1.6.0 release notes + bundled versions
- https://github.com/voidzero-dev/vite-plus/tree/main/packages/cli/templates — only monorepo/generator vendored
- https://github.com/voidzero-dev/vite-plus/issues/1327 — how Vitest is bundled/patched; jsdom/happy-dom optional peers
- https://github.com/voidzero-dev/vite-plus/issues/2416 — `vp preview` framework output caveat
- https://vite.dev/guide/features — Glob Import, custom queries, `?raw`, Rolldown pre-bundling
- https://vite.dev/config/shared-options — `appType` (SPA fallback default), `base`, `plugins`, `css.postcss`
- https://vite.dev/guide/static-deploy — `dist` default, `build.outDir`, preview-is-not-prod, Firebase rewrite
- https://tailwindcss.com/docs/installation/using-vite — `@tailwindcss/vite` steps
- https://tailwindcss.com/docs/installation/using-postcss — PostCSS alternative

Secondary / referenced only for context:

- https://viteplus.dev/guide/upgrade — preview releases and `vp upgrade`

---

## Uncertain / verify at build time

1. **Generated directory tree for `vite:application` / `vite -- --template react-ts`** — not published
   anywhere on viteplus.dev. Run the scaffold and record the actual tree (expect create-vite's `react-ts`
   layout plus `vite.config.ts` with `vite-plus` blocks, a Node pin and a PM pin). Confirm with
   `vp create --list`.
2. **Whether `vite:application` prompts for framework separately from `create-vite`'s `--template`** — the
   docs do not say. `-- --template react-ts` is the documented, unambiguous React+TS path.
3. **`.`md` + `?raw` under Vite 8/Rolldown** — the general `?raw` and glob+query behaviour is documented;
   `.md` specifically is never named. Verify one recipe file compiles in both dev and `vp build`, and check
   whether the raw strings land in the entry chunk (eager) or one chunk per recipe (lazy).
4. **Frontmatter parsing** — Vite+ documents nothing. Pick `gray-matter` (or hand-rolled YAML) and confirm
   it survives the build (it runs at module scope, so a Node-only parser must not sneak a `fs` import in).
5. **jsdom/happy-dom + React Testing Library config under Vite+** — no Vite+-authored example exists; the
   optional-peer status comes from a maintainer issue, not the docs. Verify `test.environment: 'jsdom'`
   actually resolves.
6. **Oxfmt Tailwind class sorting** — only mentioned incidentally in the 1.6.0 changelog; option name and
   defaults unverified. Check Oxfmt's config docs / `vp fmt --help`.
7. **Exact `vite.config.ts` contents `vp create` writes** (which lint rules, whether `typeAware`/
   `typeCheck` are literally in the file, whether `.node-version` vs `devEngines.runtime` is used) — the
   docs only say create "enables" the settings. Read the generated file.
8. **Node requirement check** — Vite+ 1.6.0 needs Node `^22.18.0 || ^24.11.0 || >=26.0.0`. Confirm the
   build machine's Node before scaffolding (`vp env current`).
9. **Host-specific SPA rewrite syntax** — Vite documents the Firebase form only. Translate to your host's
   SPA-fallback setting and verify `https://<subdomain>/recipes/cacio-e-pepe` returns `index.html` with a
   200 rather than a 404.
10. **Whether `vite-plus` currently pins `vite` 8.x in a way that blocks a Tailwind plugin version** — both
    were already seen together in the wild (`tailwindcss@4.2.1` + `@tailwindcss/vite@4.2.1` alongside
    `vite-plus`, per https://github.com/voidzero-dev/vite-plus/issues/992), but confirm after install with
    `vp toolchain`.
