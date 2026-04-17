from typing import AsyncIterator

from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyHeader
from sqlalchemy.ext.asyncio import AsyncSession

from .config import settings
from .database import SessionLocal
from .repositories import BookmarkRepository
from .services import BookmarkService

_api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def require_api_key(key: str | None = Depends(_api_key_header)) -> None:
    if key is None or key != settings.api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="invalid api key",
        )


async def get_session() -> AsyncIterator[AsyncSession]:
    async with SessionLocal() as session:
        yield session


def get_repository(
    session: AsyncSession = Depends(get_session),
) -> BookmarkRepository:
    return BookmarkRepository(session)


def get_service(
    repo: BookmarkRepository = Depends(get_repository),
) -> BookmarkService:
    return BookmarkService(repo)
