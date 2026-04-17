from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


def _normalize_tags(value: str | list[str] | None) -> list[str]:
    if value is None:
        return []
    if isinstance(value, str):
        value = value.split(",")
    return [t.strip() for t in value if t and t.strip()]


class BookmarkBase(BaseModel):
    url: str = Field(..., max_length=2048)
    title: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=4000)
    tags: list[str] = Field(default_factory=list)
    category: str = Field(..., min_length=1, max_length=64)

    @field_validator("tags", mode="before")
    @classmethod
    def _split_tags(cls, v):
        return _normalize_tags(v)

    @field_validator("category")
    @classmethod
    def _clean_category(cls, v: str) -> str:
        return v.strip().lower()


class BookmarkCreate(BookmarkBase):
    pass


class BookmarkUpdate(BaseModel):
    url: str | None = Field(default=None, max_length=2048)
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=4000)
    tags: list[str] | None = None
    category: str | None = Field(default=None, min_length=1, max_length=64)
    is_archived: bool | None = None

    @field_validator("tags", mode="before")
    @classmethod
    def _split_tags(cls, v):
        if v is None:
            return None
        return _normalize_tags(v)

    @field_validator("category")
    @classmethod
    def _clean_category(cls, v):
        if v is None:
            return None
        return v.strip().lower()


class BookmarkRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    url: str
    title: str
    description: str | None
    tags: list[str]
    category: str
    is_archived: bool
    view_count: int
    created_at: datetime
    updated_at: datetime

    @field_validator("tags", mode="before")
    @classmethod
    def _split_tags(cls, v):
        return _normalize_tags(v)


class BookmarkList(BaseModel):
    items: list[BookmarkRead]
    total: int
    page: int
    page_size: int
