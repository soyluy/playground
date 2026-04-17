from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Bookmark


class BookmarkRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def add(self, bm: Bookmark) -> Bookmark:
        self.session.add(bm)
        await self.session.commit()
        await self.session.refresh(bm)
        return bm

    async def get(self, bookmark_id: int) -> Bookmark | None:
        return await self.session.get(Bookmark, bookmark_id)

    async def get_by_url(self, url: str) -> Bookmark | None:
        stmt = select(Bookmark).where(Bookmark.url == url).limit(1)
        res = await self.session.execute(stmt)
        return res.scalar_one_or_none()

    async def list(
        self,
        *,
        category: str | None = None,
        tag: str | None = None,
        page: int = 1,
        page_size: int = 50,
    ) -> list[Bookmark]:
        conditions = [Bookmark.is_archived.is_(False)]
        if category:
            conditions.append(Bookmark.category == category)
        if tag:
            conditions.append(Bookmark.tags.ilike(f"%{tag}%"))

        stmt = (
            select(Bookmark)
            .where(and_(*conditions))
            .order_by(Bookmark.created_at.desc())
            .limit(page_size)
            .offset((page - 1) * page_size)
        )
        res = await self.session.execute(stmt)
        return list(res.scalars().all())

    async def list_archived(
        self, *, page: int = 1, page_size: int = 50
    ) -> list[Bookmark]:
        stmt = (
            select(Bookmark)
            .where(Bookmark.is_archived.is_(True))
            .order_by(Bookmark.updated_at.desc())
            .limit(page_size)
            .offset((page - 1) * page_size)
        )
        res = await self.session.execute(stmt)
        return list(res.scalars().all())

    async def count(
        self, *, category: str | None = None, tag: str | None = None
    ) -> int:
        conditions = [Bookmark.is_archived.is_(False)]
        if category:
            conditions.append(Bookmark.category == category)
        if tag:
            conditions.append(Bookmark.tags.ilike(f"%{tag}%"))
        stmt = select(func.count(Bookmark.id)).where(and_(*conditions))
        res = await self.session.execute(stmt)
        return int(res.scalar_one())

    async def count_in_category(self, category: str) -> int:
        stmt = select(func.count(Bookmark.id)).where(
            and_(Bookmark.category == category, Bookmark.is_archived.is_(False))
        )
        res = await self.session.execute(stmt)
        return int(res.scalar_one())

    async def update(self, bm: Bookmark, fields: dict) -> Bookmark:
        for key, value in fields.items():
            setattr(bm, key, value)
        await self.session.commit()
        await self.session.refresh(bm)
        return bm

    async def delete(self, bm: Bookmark) -> None:
        await self.session.delete(bm)
        await self.session.commit()

    async def bump_view_count(self, bm: Bookmark) -> None:
        bm.view_count += 1
        await self.session.commit()
