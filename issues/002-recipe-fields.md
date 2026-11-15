---
id: 2
title: A recipe's fields beyond ingredients and steps
status: closed
labels: ["wayfinder:grilling"]
parent: 1
blocked_by: []
assignee: bestii
created: 2026-11-15
---

## Question

Which fields does a Recipe carry beyond its title, its ingredient lines and its steps?

The app only ever *renders* those three, but the file may carry data that never renders — a source URL for "where I found it", a note-to-self, time/servings — and the answer fixes the TypeScript type, the frontmatter parser, what the prototype ticket may show, and what the build validates. It also decides the one field a recipe cannot ship without.

Sub-questions to settle in the same conversation, because they fall out of the shape:

- Is the file name the URL slug, or is the slug an explicit field? What happens when two files would collide on one slug?
- What order does the recipe list appear in — file name, title alphabetically, or a manual order?
- Does a recipe need anything the list view shows besides its title?

Expect to write or extend `GLOSSARY.md` here: Recipe, Ingredient, Step.

## Resolution

A recipe is exactly `{ title, ingredients, steps }`. Nothing else is stored, and nothing else renders.

- **Title** is required, and the list sorts A–Z by it (case-insensitive `localeCompare`).
- **Ingredients** are required, non-empty plain-text lines, rendered in file order.
- **Steps** are a numbered list in the Markdown body. A line that isn't numbered is joined onto the step above, so long steps can wrap.
- **The file name is the slug** (`src/recipes/dal-tadka.md` → `/recipes/dal-tadka`), so uniqueness comes free and there is no slug field.
- **The list shows** the title plus a derived `N ingredients · N steps` line; that is computed, not authored.

Implemented in `src/lib/recipe.ts`.
