# Playground

Personal engineering playground — product experiments, stack practice, and puzzle write-ups in one place.

**Hub** (in `js-monorepo/`) is the main piece — and a work in progress. I build on it at my own speed whenever I have extra time. It's also practice: I'll take the longer path (e.g. GraphQL infra for resources and other domains) to learn the stack, not because the product required it. The idea: a personal agent for people who can't afford an assistant. It captures todos, expenses, calendar events, and resources, then works asynchronously on your behalf (research, context prep, surfacing what matters).

## Sections

| Folder | What it is |
| --- | --- |
| [`js-monorepo/`](./js-monorepo/) | Nx workspace — shared libs across apps; **Hub** is the primary product here |
| [`nerisa/`](./nerisa/) | JavaFX week planner |
| [`code-review/`](./code-review/) | Apps with intentional bugs for code-review practice (FastAPI, Spring Boot, Nest + Angular) |
| [`games/`](./games/) | Puzzle / CTF solutions (SQL Murder Mystery, OverTheWire) |
| [`css-practice/`](./css-practice/) | Layout and CSS experiments |

## How to explore

1. Start with **Hub** in [`js-monorepo/`](./js-monorepo/) if you want the product surface.
2. Or open a single [`code-review/`](./code-review/) exercise for a focused stack sample.
3. Setup and run instructions live in each section's README (where present) — not here.

## Stack snapshot

- **TypeScript / Nx** — Nest, Angular, Prisma, Jest
- **Java** — Spring Boot, JavaFX
- **Python** — FastAPI, SQLAlchemy

## Status

Uneven maturity by design. Hub is the intentional product; everything else is deliberate practice or reference material.
