# js-monorepo

Nx workspace for TypeScript apps that I personally develop and can share libraries. Apps are independent products; libs exist so domains and infra can be reused across them.

**Hub** is the main app here — and a work in progress. I build on it at my own speed whenever I have extra time. It's also deliberate practice: I often take the longer path (e.g. GraphQL infra for resources and other domains) to learn the stack, not because the product required it.

## Hub

A personal agent for people who can't afford an assistant. It captures todos, expenses, calendar events, and resources in one place, and works asynchronously on your behalf — researching, preparing context, and surfacing relevant material while you're away.

> Assistants for people who can't afford an assistant.

Product notes: [`docs/hub/vision.txt`](./docs/hub/vision.txt). Scratch decisions: [`DECISIONS.md`](./DECISIONS.md).

**What's different:** not the all-in-one aspect — the async preparation loop. You capture, the agent works, you come back to context ready to act.

**Agent (v1):** flag a todo for AI research → agent infers context → runs a research pipeline → surfaces results (and optionally resources). No chat UI yet; no user configuration — all inferred.

**Modules:** todos, expenses, calendar/events, resources, AI research. Tags and auth glue them together. Hub domain code lives under `libs/<domain>/{api,data,ui}` where applicable.

## Apps

| Path                               | Role                                                         |
| ---------------------------------- | ------------------------------------------------------------ |
| `apps/hub`                         | Hub Angular UI (dev server on port `8181`; starts `hub-api`) |
| `apps/hub-api`                     | Hub Nest GraphQL API                                         |
| `apps/hub-e2e`, `apps/hub-api-e2e` | Hub E2E suites                                               |
| `apps/livestream-api`              | Separate HLS livestream practice app (not part of Hub) — see its README |

## Libs

| Path          | Role                                                  |
| ------------- | ----------------------------------------------------- |
| `libs/*`      | Shared domain and infra libraries (reuse across apps) |
| `libs/prisma` | Prisma schema / client                                |

## Stack

Nx · Angular · NestJS · GraphQL (Apollo) · Prisma · PostgreSQL · MongoDB · Google OAuth · Jest / Playwright

## Quick start (Hub)

```bash
npm install
cp .env.example .env   # fill DATABASE_URL, OAuth, session, etc.
npx prisma migrate dev
npx nx serve hub       # UI + API
```

Useful commands:

```bash
npx nx serve hub-api
npx nx serve livestream-api
npx nx graph
```

## Status

Uneven by design. Hub's capture modules and research plumbing are further along than polish, scheduling, and deployment. Other apps here are independent experiments.
