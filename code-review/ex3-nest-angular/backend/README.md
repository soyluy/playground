# Live Auction API

NestJS backend for the live auction platform. Part of a **code review** exercise — see [`../README.md`](../README.md).

Swagger UI is mounted at `/docs` (configurable). HTTP + Socket.io for realtime auction events.

## Stack

NestJS · TypeORM · PostgreSQL · Socket.io · JWT auth · class-validator · Swagger

## Setup

```bash
cd backend
cp .env.example .env   # DB_*, JWT_*, PORT, CORS_ORIGIN, etc.
# install deps once package manifests are present, then:
npm run start:dev
```

Defaults from `.env.example`: port **3000**, CORS `http://localhost:4200`, DB `auction_platform`.

## Modules (high level)

| Area | Routes (examples) |
| --- | --- |
| Auth | `/auth/register`, `login`, `refresh`, verify / reset password |
| Auctions | `/auctions` CRUD-ish flow, publish, cancel, buy-now, watch |
| Bids | place bid, list, auto-bid |
| Users | `/users/me` profile, auctions, bids, wallet deposit/withdraw, watchlist, notifications |
| Admin | stats, auctions, users, ban |

Realtime gateway covers join/leave auction, bid updates, notifications, and admin monitoring events (see frontend README for client event names).
