from fastapi import APIRouter, HTTPException, Query

from .. import schemas
from ..services.unsplash import UnsplashError, search_photos

router = APIRouter(prefix="/api/photos", tags=["photos"])


@router.get("/search", response_model=schemas.PhotoSearchResponse)
def search_photos_endpoint(
    keywords: str = Query(..., description="쉼표로 구분된 키워드 목록"),
    per_page: int = Query(9, ge=1, le=12),
):
    keyword_list = [k.strip() for k in keywords.split(",") if k.strip()]
    if not keyword_list:
        raise HTTPException(status_code=400, detail="keywords 파라미터가 필요합니다")

    try:
        results, fallback = search_photos(keyword_list, per_page=per_page)
    except UnsplashError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return schemas.PhotoSearchResponse(results=results, fallback=fallback)
