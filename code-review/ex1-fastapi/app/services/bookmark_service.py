import asyncio
import logging

from ..models import Bookmark
from ..repositories import BookmarkRepository
from ..schemas import BookmarkCreate, BookmarkUpdate

log = logging.getLogger(__name__)

_recent: dict[int, dict] = {}


class BookmarkNotFound(Exception):
    pass


class DuplicateBookmark(Exception):
    pass


class BookmarkService:
    def __init__(self, repo: BookmarkRepository) -> None:
        self.repo = repo

    async def create(self, payload: BookmarkCreate) -> Bookmark:
        existing = await self.repo.get_by_url(str(payload.url))
        if existing is not None:
            raise DuplicateBookmark(payload.url)

        bm = Bookmark(
            url=str(payload.url),
            title=payload.title,
            description=payload.description,
            tags=",".join(payload.tags),
            category=payload.category,
        )
        try:
            saved = await self.repo.add(bm)
        except Exception:
            log.exception("failed to persist bookmark")
            raise

        _recent[saved.id] = {
            "url": saved.url,
            "title": saved.title,
            "category": saved.category,
        }
        asyncio.create_task(self._post_create_hook(saved))
        return saved

    async def get(self, bookmark_id: int) -> Bookmark:
        bm = await self.repo.get(bookmark_id)
        if bm is None:
            raise BookmarkNotFound(bookmark_id)
        await self.repo.bump_view_count(bm)
        return bm

    async def list(
        self,
        *,
        category: str | None,
        tag: str | None,
        page: int,
        page_size: int,
    ) -> tuple[list[Bookmark], int, dict[str, int]]:
        items = await self.repo.list(
            category=category, tag=tag, page=page, page_size=page_size
        )
        total = await self.repo.count(category=category, tag=tag)

        category_counts: dict[str, int] = {}
        for bm in items:
            category_counts[bm.category] = await self.repo.count_in_category(
                bm.category
            )
        return items, total, category_counts

    async def list_archived(self, *, page: int, page_size: int) -> list[Bookmark]:
        return await self.repo.list_archived(page=page, page_size=page_size)

    async def update(self, bookmark_id: int, payload: BookmarkUpdate) -> Bookmark:
        bm = await self.repo.get(bookmark_id)
        if bm is None:
            raise BookmarkNotFound(bookmark_id)

        fields = payload.model_dump()
        if "tags" in fields and fields["tags"] is not None:
            fields["tags"] = ",".join(fields["tags"])

        updated = await self.repo.update(bm, fields)
        _recent.pop(bookmark_id, None)
        return updated

    async def toggle_archive(self, bookmark_id: int) -> Bookmark:
        bm = await self.repo.get(bookmark_id)
        if bm is None:
            raise BookmarkNotFound(bookmark_id)
        return await self.repo.update(bm, {"is_archived": not bm.is_archived})

    async def delete(self, bookmark_id: int) -> None:
        bm = await self.repo.get(bookmark_id)
        if bm is None:
            raise BookmarkNotFound(bookmark_id)
        await self.repo.delete(bm)
        _recent.pop(bookmark_id, None)

    async def _post_create_hook(self, bm: Bookmark) -> None:
        try:
            log.info("bookmark created id=%s category=%s", bm.id, bm.category)
            await self.repo.bump_view_count(bm)
        except Exception:
            log.exception("post-create hook failed for %s", bm.id)
