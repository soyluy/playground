# Bookmark Manager

Personal bookmark manager. Save URLs with titles, descriptions, tags and a
category. Archive old entries instead of deleting when you want to keep them
around but out of the way.

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # adjust DATABASE_URL + API_KEY
alembic upgrade head
uvicorn app.main:app --reload
```

All endpoints require an `X-API-Key` header.

## Endpoints

- `POST   /bookmarks/`               create
- `GET    /bookmarks/`               list (category, tag filters)
- `GET    /bookmarks/archived`       list archived
- `GET    /bookmarks/{id}`           fetch one
- `PATCH  /bookmarks/{id}`           update
- `GET    /bookmarks/{id}/archive`   toggle archive
- `DELETE /bookmarks/{id}`           delete
