# hub-api

NestJS backend for **Hub** — GraphQL + REST under the `/api` prefix.

Product context and WIP notes: [`../../README.md`](../../README.md) and [`../../docs/hub/vision.txt`](../../docs/hub/vision.txt).

## What it does

Composition root: wires domain API modules, auth, infra, and shared GraphQL.

| Concern | How |
| --- | --- |
| Todos, expenses, research | Nest modules from `@hub/*-api` |
| Resources | GraphQL (Apollo) — also deliberate practice for GraphQL infra |
| Auth | Google OAuth via Passport + express-session (Postgres store) |
| Data | Prisma/Postgres (sessions + relational), MongoDB (Mongoose) for some domains |
| API surface | Global prefix `api`; GraphQL at `/api/graphql` |

Default port **3000**. CORS allows credentials for the Angular origin.

## Run

From the monorepo root (`js-monorepo/`):

```bash
cp .env.example .env   # DATABASE_URL, SESSION_SECRET, Google OAuth, Mongo, etc.
npx nx serve hub-api
```

Usually started automatically with `npx nx serve hub`.

```bash
npx nx build hub-api
npx nx test hub-api
```

## Stack

NestJS · Apollo GraphQL · Passport (Google) · express-session / connect-pg-simple · Prisma · Mongoose · domain `@hub/*-api` libs
