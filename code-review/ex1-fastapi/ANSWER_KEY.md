# Answer Key — ex1-fastapi

Planted mistake counts (target): Easy 6 · Medium 8 · Hard 6 · Discussion 4

---

## EASY (6)

### E1 — POST create returns 200 instead of 201
- File: `app/routers/bookmark_router.py`, `create_bookmark` decorator
- The `@router.post("/", response_model=BookmarkRead)` has no `status_code=status.HTTP_201_CREATED`. FastAPI defaults to 200.
- Fix: add `status_code=status.HTTP_201_CREATED`.

### E2 — DELETE returns 200 with a body instead of 204
- File: `app/routers/bookmark_router.py`, `delete_bookmark`
- Returns `{"deleted": bookmark_id}` at the default 200. Successful deletions should be 204 No Content (or at least 200 is tolerable, but never with a payload when semantics expect no body).
- Fix: `status_code=status.HTTP_204_NO_CONTENT` and return nothing.

### E3 — No URL validation on input
- File: `app/schemas/bookmark.py`, `BookmarkBase.url` and `BookmarkUpdate.url`
- Typed as `str` with only a length cap. Callers can save `"not a url"` or `"javascript:alert(1)"` as a "bookmark."
- Fix: use `pydantic.HttpUrl`/`AnyHttpUrl` and coerce to `str` at persistence time.

### E4 — Archive toggle uses GET
- File: `app/routers/bookmark_router.py`, `@router.get("/{bookmark_id}/archive")`
- Toggling archive is a state mutation. GET must be safe and idempotent; prefetchers, browser history replay and caches will misbehave.
- Fix: `POST` (or `PATCH`) for the archive action, and ideally an explicit `archive`/`unarchive` pair rather than a toggle.

### E5 — Tag filter matches substrings
- File: `app/repositories/bookmark_repository.py`, `list` and `count`
- `Bookmark.tags.ilike(f"%{tag}%")` treats the comma-separated string as free text: `py` matches `python`, `pypi`, `happy`; it also matches across tag boundaries.
- Fix: normalize tags into their own table (or an array/JSONB column), or at minimum anchor the LIKE with delimiters, e.g. match `%,{tag},%` against `","||tags||","`.

### E6 — Update returns 400 instead of 404 when target doesn't exist
- File: `app/routers/bookmark_router.py`, `update_bookmark`
- Catches `BookmarkNotFound` and returns `HTTP_400_BAD_REQUEST`. The request was well-formed; the resource simply doesn't exist.
- Fix: `HTTP_404_NOT_FOUND`.

---

## MEDIUM (8)

### M1 — N+1 in listing
- File: `app/services/bookmark_service.py`, `list`
- After fetching `items`, the loop calls `repo.count_in_category(bm.category)` once per row — an extra query per item. The resulting `category_counts` dict is then thrown away by the router (`_counts`).
- Fix: drop the computation, or do it in a single `GROUP BY` query.

### M2 — Commits inside the repository
- File: `app/repositories/bookmark_repository.py`, `add`, `update`, `delete`, `bump_view_count`
- The repo is the wrong transaction boundary. Services can't compose multiple repo calls into one unit of work; multi-step operations become non-atomic and `get_session` can't own the transaction.
- Fix: repository only `add`/`delete`/`flush`; commit happens once per request, either in the session dependency or at the service boundary.

### M3 — TOCTOU on uniqueness check
- File: `app/services/bookmark_service.py`, `create`
- `get_by_url` then `add` is a classic check-then-act race. Two concurrent creators both see "not present" and both insert duplicates.
- Fix: enforce uniqueness in the DB (unique index on `url`) and handle `IntegrityError` as the authoritative duplicate signal.

### M4 — `model_dump()` without `exclude_unset=True`
- File: `app/services/bookmark_service.py`, `update`
- `payload.model_dump()` returns every field; unset optional fields come back as `None` and then clobber existing DB values. A PATCH of `{"title": "x"}` wipes `description`, `category`, etc.
- Fix: `payload.model_dump(exclude_unset=True)`.

### M5 — Write-on-read with a lost-update race
- File: `app/services/bookmark_service.py`, `get`; `app/repositories/bookmark_repository.py`, `bump_view_count`
- Every GET mutates state (`view_count`), so reads are not idempotent and every GET takes a write lock / commit. Worse, the increment is `bm.view_count += 1` → read-modify-write in Python: concurrent readers lose updates.
- Fix: move the counter to an explicit endpoint, or at least use an atomic `UPDATE bookmarks SET view_count = view_count + 1 WHERE id = ...` and consider whether it belongs on the read path at all.

### M6 — Fire-and-forget task reusing the request-scoped session
- File: `app/services/bookmark_service.py`, `create` / `_post_create_hook`
- `asyncio.create_task(self._post_create_hook(saved))` outlives the request. By the time the task runs, `get_session`'s `async with` may have already closed the `AsyncSession` and the repo's session reference is invalid. Under load this surfaces as intermittent `InvalidRequestError` / "session is closed" / orphaned connections.
- Fix: either make the hook synchronous-within-request, or hand the background work to a proper worker (task queue, background tasks with their own session factory).

### M7 — `exclude_unset` vs partial-update semantics on `is_archived`
- File: `app/services/bookmark_service.py`, `update`
- Even after fixing M4, the current code has no separation between "archive via PATCH" and "archive via dedicated endpoint" — so callers can set `is_archived` through both paths, and a missing field silently means "set archived to null/False." Tied to M4 but worth its own note: the service blindly trusts every field in `BookmarkUpdate`, including state that should only transition via domain operations.
- Fix: either remove `is_archived` from `BookmarkUpdate` (force the dedicated endpoint), or guard it in the service.

### M8 — Business logic leaking into the repository
- File: `app/repositories/bookmark_repository.py`, `list`, `count`, `count_in_category`
- "Archived bookmarks are excluded from default listings" is a product rule, hardcoded inside the repository. The repo now cannot be reused for admin views, exports, or anything that needs all rows. It also forces a parallel `list_archived` method that duplicates paging/order logic.
- Fix: push the archived filter into the service; let the repo expose composable predicates or accept an `include_archived` flag.

---

## HARD (6)

### H1 — Timing-unsafe API key comparison
- File: `app/dependencies.py`, `require_api_key`
- `key != settings.api_key` is a short-circuiting byte-wise compare. Over enough requests an attacker can measure per-byte timing differences and recover the key. API keys are secrets and should be compared in constant time.
- Fix: `hmac.compare_digest(key or "", settings.api_key)`.

### H2 — ORM models leaking through the response
- File: `app/routers/bookmark_router.py`, `list_archived`
- The endpoint has no `response_model` and returns the raw ORM list. FastAPI will serialize whatever attributes `jsonable_encoder` finds — including any internal column added later (ownership, IP, soft-delete metadata, counters) — with no way to filter. This is an architectural boundary violation: the ORM shape is now part of the public API contract.
- Fix: declare `response_model=list[BookmarkRead]` (or a paginated envelope) and validate explicitly, the same as every other route.

### H3 — Module-level mutable cache without synchronization
- File: `app/services/bookmark_service.py`, top-level `_recent: dict[int, dict]`
- A module-level dict mutated from `create`/`update`/`delete` is shared across all requests and all workers of a single process. Concurrent asyncio tasks that interleave around the `dict` itself are (currently) safe because of the GIL, but: the data is per-process (broken with multiple workers), unbounded (slow memory leak), and invisible to the cache-control story of the app. It will also go stale the moment anything updates rows outside this service. It masquerades as a harmless optimization.
- Fix: remove it, or replace with an explicit bounded cache keyed outside the process (Redis) with TTL and invalidation semantics.

### H4 — Alembic creates timezone-naive timestamp columns
- File: `alembic/versions/20250412_0001_create_bookmarks.py`
- Model declares `DateTime(timezone=True)`; migration uses plain `sa.DateTime()` (no `timezone=True`). Postgres will create `TIMESTAMP WITHOUT TIME ZONE` while the ORM expects `TIMESTAMPTZ`. Reads/writes work, but you silently store naive datetimes, ordering across DST changes is wrong, and any future migration that assumes `timestamptz` (or a replica in a different TZ) will corrupt data.
- Fix: `sa.DateTime(timezone=True)` in the migration, and add an explicit data migration if the table is already populated.

### H5 — Production-usable default for `API_KEY`
- File: `app/config.py`, `Settings.api_key`
- `api_key: str = Field(default="change-me")`. The app boots without the env var set, in production, with a globally-known key. Same pattern for `database_url` masks misconfiguration.
- Fix: no default (`Field(...)`) or a startup-time assertion that rejects the placeholder in non-debug environments.

### H6 — Settings and engine are captured at import time
- File: `app/config.py` (`@lru_cache` + module-level `settings = get_settings()`), `app/database.py` (module-level `engine = create_async_engine(...)`)
- The first import freezes configuration. Tests that mutate env vars after import, 12-factor-style runtime config changes, and anything that needs to swap the DB URL (ephemeral test containers, tenant routing) don't work without calling `get_settings.cache_clear()` *and* rebuilding `engine` and `SessionLocal`. Works fine locally, breaks in CI / prod in ways that look like "flaky tests" or "won't pick up new secrets."
- Fix: inject settings/engine via FastAPI dependencies or the app state; don't materialize them at import time.

---

## DISCUSSION (4)

### D1 — Repository layer for a single-table CRUD
- The repository is a thin wrapper over `session.execute` with no alternative implementations in sight. One camp: the indirection buys testability (mock the repo), a migration path to multiple backends, and a clean boundary. Other camp: it's ceremony that duplicates SQLAlchemy's own abstraction; services could call the session directly and delete a file. Neither is objectively wrong for a system of this size.

### D2 — Separate `/archived` endpoint vs `?archived=true` query param
- Separate endpoint is discoverable and makes routing/permissions easy to split later. Query param is more RESTful and avoids duplicating paging logic. Reasonable teams land on either.

### D3 — Tags as a comma-separated string
- Pros: one column, no joins, trivial to read/write, matches the "plain strings" requirement literally. Cons: impossible to index efficiently, every query is `ILIKE`, normalization is client-side, tag renames are a table scan. If tag filtering grows beyond toy usage, this will be refactored to a `tags` + `bookmark_tags` pair or a `text[]` column.

### D4 — `BookmarkService` instantiated per request
- Currently the service and repository are constructed fresh on every request via `Depends`. Arguments in favor: clean scoping, no shared state, easy to reason about. Arguments against: allocation overhead, and services often want to hold long-lived collaborators (caches, HTTP clients) that re-creating per request defeats. The right answer depends on what the service grows into.
