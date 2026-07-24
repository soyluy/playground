# Order Processor

Spring Boot order-processing backend: customers, products, orders, payments, and admin ops. Built for **code review practice** — see [`../README.md`](../README.md).

## Stack

Java 17 · Spring Boot 3.2 · Spring Web / Data JPA / Security / Validation / Cache / Actuator · Flyway · PostgreSQL · JWT · Caffeine

Layered roughly as `web` → `application` → `domain` / `infrastructure` (ports & adapters style).

## Setup

PostgreSQL database (defaults from config):

```text
DB: orderprocessor_dev (dev profile)
user / password: orderprocessor / orderprocessor
```

```bash
cd ex2-spring-boot
./mvnw spring-boot:run
# or: mvn spring-boot:run
```

Default port **8080**. Active profile: `dev` (`application.yml`). Override with `DB_URL`, `DB_USER`, `DB_PASSWORD`, `SERVER_PORT`, `JWT_SECRET`, etc.

Flyway migrations live under `src/main/resources/db/migration/`.

## API surface (high level)

| Prefix | Concern |
| --- | --- |
| `/api/customers` | CRUD, loyalty points, tier, customer orders |
| `/api/products` | CRUD, SKU lookup, stock updates |
| `/api/orders` | Create, status, list/filter, cancel |
| `/api/payments` | Initiate, process, refund, webhook, status |
| `/api/admin` | Stats, revenue, low stock, bulk updates |

Also: scheduled order-timeout / inventory jobs, external payment + email client stubs, audit logging.
