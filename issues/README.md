# Local-markdown tracker

No external tracker is configured for this repo, so wayfinding runs on these files.

## Conventions

- One issue per file: `issues/NNN-<slug>.md`, numbered in creation order.
- Frontmatter is the queryable part:

```yaml
---
id: 2
title: Short, readable name
status: open          # open | closed
labels: ["wayfinder:grilling"]
parent: 1             # the map issue id, or null for the map itself
blocked_by: []
assignee: null
created: 2026-11-15
---
```

- **The map** is the issue labelled `wayfinder:map`.
- **Child tickets** are issues whose `parent` is the map id.
- **Claim** = set `assignee` to your handle **before** any work. An open, unassigned ticket is unclaimed.
- **Blocking** = native dependency via `blocked_by` (issue ids).
- **Frontier** = open, unassigned child tickets whose every `blocked_by` entry is closed. That is the edge of the known; take from it.
- **Resolution** = append a `## Resolution` section with the answer, set `status: closed`, and add one line to the map's *Decisions so far* naming the ticket and gisting the answer.

## Wayfinding operations

- Load the map low-res only; fetch ticket bodies on demand.
- One ticket per session (research tickets are the exception and may run in parallel).
- Do not resolve a HITL ticket by answering for the human.
