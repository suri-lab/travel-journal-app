from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..services.keyword_extraction import KeywordExtractionError, extract_keywords

router = APIRouter(prefix="/api/journal", tags=["journal"])


@router.post("/extract-keywords", response_model=schemas.ExtractKeywordsResponse)
def extract_keywords_endpoint(payload: schemas.ExtractKeywordsRequest):
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="내용을 입력하세요")

    try:
        result = extract_keywords(text)
    except KeywordExtractionError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    if len(result["keywords"]) < 5:
        raise HTTPException(status_code=502, detail="키워드 추출 결과가 불충분합니다")

    return result


@router.post("/create", response_model=schemas.JournalCreateResponse, status_code=201)
def create_journal(payload: schemas.JournalCreateRequest, db: Session = Depends(get_db)):
    journal = models.Journal(
        text=payload.text,
        location=payload.location,
        travel_date=payload.travel_date,
    )
    db.add(journal)
    db.flush()

    photo = models.Photo(
        photo_id=payload.selected_photo.id,
        journal_id=journal.journal_id,
        full_url=payload.selected_photo.full_url,
        thumb_url=payload.selected_photo.thumb_url,
        photographer=payload.selected_photo.photographer,
        photographer_url=payload.selected_photo.photographer_url,
    )
    db.add(photo)

    for kw in payload.keywords:
        db.add(models.Keyword(journal_id=journal.journal_id, keyword=kw))

    db.commit()
    db.refresh(journal)

    return schemas.JournalCreateResponse(journal_id=journal.journal_id, created_at=journal.created_at)


@router.get("/timeline", response_model=schemas.TimelineResponse)
def get_timeline(sort: str = "desc", page: int = 1, size: int = 20, db: Session = Depends(get_db)):
    query = db.query(models.Journal)
    total = query.count()

    order = models.Journal.travel_date.desc() if sort == "desc" else models.Journal.travel_date.asc()
    journals = (
        query.order_by(order, models.Journal.created_at.desc())
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )

    items = [
        schemas.TimelineItem(
            journal_id=j.journal_id,
            travel_date=j.travel_date,
            location=j.location,
            thumb_url=j.photo.thumb_url if j.photo else None,
            excerpt=(j.text[:80] + "…") if len(j.text) > 80 else j.text,
        )
        for j in journals
    ]

    return schemas.TimelineResponse(items=items, total=total, page=page, size=size)


@router.get("/{journal_id}", response_model=schemas.JournalDetailResponse)
def get_journal_detail(journal_id: str, db: Session = Depends(get_db)):
    journal = db.get(models.Journal, journal_id)
    if not journal:
        raise HTTPException(status_code=404, detail="여행일지를 찾을 수 없습니다")

    photo = None
    if journal.photo:
        photo = schemas.SelectedPhoto(
            id=journal.photo.photo_id,
            full_url=journal.photo.full_url,
            thumb_url=journal.photo.thumb_url,
            photographer=journal.photo.photographer,
            photographer_url=journal.photo.photographer_url,
        )

    return schemas.JournalDetailResponse(
        journal_id=journal.journal_id,
        text=journal.text,
        location=journal.location,
        travel_date=journal.travel_date,
        created_at=journal.created_at,
        photo=photo,
        keywords=[k.keyword for k in journal.keywords],
    )
