from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


class CategoryTags(BaseModel):
    place: Optional[str] = None
    mood: Optional[str] = None
    time: Optional[str] = None


class ExtractKeywordsRequest(BaseModel):
    text: str = Field(..., min_length=1)


class ExtractKeywordsResponse(BaseModel):
    keywords: list[str]
    category_tags: CategoryTags


class PhotoResult(BaseModel):
    id: str
    thumb_url: str
    full_url: str
    photographer: str
    photographer_url: str
    unsplash_link: str


class PhotoSearchResponse(BaseModel):
    results: list[PhotoResult]
    fallback: bool = False


class SelectedPhoto(BaseModel):
    id: str
    full_url: str
    thumb_url: Optional[str] = None
    photographer: str
    photographer_url: str


class JournalCreateRequest(BaseModel):
    text: str = Field(..., min_length=1)
    keywords: list[str] = []
    selected_photo: SelectedPhoto
    travel_date: Optional[date] = None
    location: Optional[str] = None


class JournalCreateResponse(BaseModel):
    journal_id: str
    created_at: datetime


class TimelineItem(BaseModel):
    journal_id: str
    travel_date: Optional[date] = None
    location: Optional[str] = None
    thumb_url: Optional[str] = None
    excerpt: str


class TimelineResponse(BaseModel):
    items: list[TimelineItem]
    total: int
    page: int
    size: int


class JournalDetailResponse(BaseModel):
    journal_id: str
    text: str
    location: Optional[str] = None
    travel_date: Optional[date] = None
    created_at: datetime
    photo: Optional[SelectedPhoto] = None
    keywords: list[str] = []
