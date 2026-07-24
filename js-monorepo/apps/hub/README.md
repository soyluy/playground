# hub

Angular frontend for **Hub** — the personal agent UI in this monorepo.

Product context and WIP notes: [`../../README.md`](../../README.md) and [`../../docs/hub/vision.txt`](../../docs/hub/vision.txt).

## What it does

Shell app: sidebar/topbar layout, auth bootstrap, Apollo client, and lazy-loaded feature routes from domain UI libs:

| Route | UI lib |
| --- | --- |
| `/todo` | `@hub/todo-ui` |
| `/tag-management` | `@hub/todo-ui` |
| `/expense-tracker` | `@hub/expense-ui` |
| `/resource` | `@hub/resource-ui` |
| `/calendar` | `@hub/event-ui` |

Talks to `hub-api` over HTTP (credentials) and GraphQL at `{apiUrl}/graphql`. Dev proxy: `/api` → `http://localhost:3000`.

## Run

From the monorepo root (`js-monorepo/`):

```bash
npx nx serve hub
```

Serves on port **8181** and starts `hub-api` as a dependency. Configure env via the API's `.env` (see monorepo README).

```bash
npx nx build hub
npx nx test hub
```

## Stack

Angular · Angular Material · Apollo Angular · domain `@hub/*-ui` libs · Google OAuth session (via API)
