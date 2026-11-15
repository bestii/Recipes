---
id: 3
title: Recipe list and cooking view design
status: closed
labels: ["wayfinder:prototype"]
parent: 1
blocked_by: [2]
assignee: bestii
created: 2026-11-15
---

## Question

How do the recipe list and the recipe page look and behave, on a phone first and on desktop?

This is a HITL ticket: resolve it by putting a cheap, concrete prototype in front of the user and reacting to it, not by describing layouts in prose. It can span both routes in one artifact.

What the prototype has to force a decision on:

- The recipe page read at arm's length while cooking: type scale, line length, contrast, and whether ingredients stay visible while the steps scroll.
- Whether ingredient lines and steps are tickable while cooking, and if so that it is ephemeral (state only, nothing persisted).
- How the list presents many recipes on a narrow screen, and how a recipe is entered from it.
- Desktop: does the list→detail flow become two panes or stay one column?
- Empty and not-found states.

Link the prototype artifact from this issue when it exists; do not paste markup into the body.

## Resolution

Resolved without a separate throwaway prototype: the palette and the one interactive behaviour were agreed first, then built directly, so the implemented UI is the artifact.

- **Warm paper light** on Tailwind v4 theme tokens (`paper`, `card`, `ink`, `accent`); serif headings, 17px body copy for arm's-length reading.
- **One column at every width**, capped at `max-w-2xl` and centred on desktop. No two-pane split.
- **Steps are tappable** (`aria-pressed`): a tap marks the step done, line-through at 40% ink, in-memory only, resets on reload. Ingredients are not tappable.
- **Ingredients sit above the steps** and do not stick; the recipe page is a single scroll.
- **Empty list and unknown slug** both have explicit states, and the unknown-slug state offers the way back.

Artifact: `src/routes/RecipeList.tsx` and `src/routes/RecipeDetail.tsx`.
