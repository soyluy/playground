from fastapi import APIRouter, Depends, HTTPException, Query, status

from ..config import settings
from ..dependencies import get_service, require_api_key
from ..schemas import BookmarkCreate, BookmarkList, BookmarkRead, BookmarkUpdate
from ..services import BookmarkService
from ..services.bookmark_service import BookmarkNotFound, DuplicateBookmark

router = APIRouter(
    prefix="/bookmarks",
    tags=["bookmarks"],
    dependencies=[Depends(require_api_key)],
)


@router.post("/", response_model=BookmarkRead)
async def create_bookmark(
    payload: BookmarkCreate,
    service: BookmarkService = Depends(get_service),
) -> BookmarkRead:
    try:
        bm = await service.create(payload)
    except DuplicateBookmark:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="bookmark with that url already exists",
        )
    return BookmarkRead.model_validate(bm)


@router.get("/", response_model=BookmarkList)
async def list_bookmarks(
    category: str | None = Query(default=None),
    tag: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=None, ge=1, le=200),
    service: BookmarkService = Depends(get_service),
) -> BookmarkList:
    size = page_size or settings.default_page_size
    items, total, _counts = await service.list(
        category=category, tag=tag, page=page, page_size=size
    )
    return BookmarkList(
        items=[BookmarkRead.model_validate(b) for b in items],
        total=total,
        page=page,
        page_size=size,
    )


@router.get("/archived")
async def list_archived(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=200),
    service: BookmarkService = Depends(get_service),
):
    return await service.list_archived(page=page, page_size=page_size)


@router.get("/{bookmark_id}", response_model=BookmarkRead)
async def get_bookmark(
    bookmark_id: int,
    service: BookmarkService = Depends(get_service),
) -> BookmarkRead:
    try:
        bm = await service.get(bookmark_id)
    except BookmarkNotFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="bookmark not found"
        )
    return BookmarkRead.model_validate(bm)


@router.patch("/{bookmark_id}", response_model=BookmarkRead)
async def update_bookmark(
    bookmark_id: int,
    payload: BookmarkUpdate,
    service: BookmarkService = Depends(get_service),
) -> BookmarkRead:
    try:
        bm = await service.update(bookmark_id, payload)
    except BookmarkNotFound:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"bookmark {bookmark_id} does not exist",
        )
    return BookmarkRead.model_validate(bm)


@router.get("/{bookmark_id}/archive", response_model=BookmarkRead)
async def archive_bookmark(
    bookmark_id: int,
    service: BookmarkService = Depends(get_service),
) -> BookmarkRead:
    try:
        bm = await service.toggle_archive(bookmark_id)
    except BookmarkNotFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="bookmark not found"
        )
    return BookmarkRead.model_validate(bm)


@router.delete("/{bookmark_id}")
async def delete_bookmark(
    bookmark_id: int,
    service: BookmarkService = Depends(get_service),
) -> dict:
    try:
        await service.delete(bookmark_id)
    except BookmarkNotFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="bookmark not found"
        )
    return {"deleted": bookmark_id}
