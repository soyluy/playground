# Live Auction Platform

Full-stack live auction app for **code review practice** — see [`../README.md`](../README.md).

Supports English, Dutch, reserve, and buy-it-now auctions, with realtime bidding via Socket.io.

| Part | Path | Stack |
| --- | --- | --- |
| Backend | [`backend/`](./backend/) | NestJS · TypeORM · PostgreSQL · Socket.io · JWT · Swagger |
| Frontend | [`frontend/`](./frontend/) | Angular 21 (zoneless) · Angular Material · Socket.io client |

## Domain (sketch)

Users, auction items, auctions, bids / auto-bids, watchlists, wallets / transactions, notifications, categories, admin moderation.

## How to use this exercise

1. Review backend and frontend like a PR (happy path should look plausible).
2. Only then consult personal answer keys / mistake logs if you keep them locally.
3. Setup details: [`backend/README.md`](./backend/README.md) and [`frontend/README.md`](./frontend/README.md).
