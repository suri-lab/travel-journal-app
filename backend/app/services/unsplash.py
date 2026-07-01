import os
import time

import httpx

UNSPLASH_SEARCH_URL = "https://api.unsplash.com/search/photos"
CACHE_TTL_SECONDS = 60 * 60  # 1 hour, per spec 7.2 rate-limit mitigation
MIN_ACCEPTABLE_RESULTS = 3

_cache: dict[str, tuple[float, list[dict]]] = {}


class UnsplashError(Exception):
    pass


def build_query(keywords: list[str], top_n: int = 3) -> str:
    """상위 top_n개 키워드를 공백으로 결합 (스펙 7.1)."""
    return " ".join(keywords[:top_n])


def _access_key() -> str:
    key = os.getenv("UNSPLASH_ACCESS_KEY")
    if not key:
        raise UnsplashError("UNSPLASH_ACCESS_KEY가 설정되지 않았습니다.")
    return key


def _cache_get(query: str) -> list[dict] | None:
    entry = _cache.get(query)
    if not entry:
        return None
    expires_at, results = entry
    if time.time() > expires_at:
        _cache.pop(query, None)
        return None
    return results


def _cache_set(query: str, results: list[dict]) -> None:
    _cache[query] = (time.time() + CACHE_TTL_SECONDS, results)


def _map_result(photo: dict) -> dict:
    return {
        "id": photo["id"],
        "thumb_url": photo["urls"]["thumb"],
        "full_url": photo["urls"]["full"],
        "photographer": photo["user"]["name"],
        "photographer_url": photo["user"]["links"]["html"],
        "unsplash_link": photo["links"]["html"],
    }


def _search(query: str, per_page: int) -> list[dict]:
    cached = _cache_get(query)
    if cached is not None:
        return cached

    response = httpx.get(
        UNSPLASH_SEARCH_URL,
        params={"query": query, "per_page": per_page, "page": 1},
        headers={"Authorization": f"Client-ID {_access_key()}"},
        timeout=10.0,
    )
    response.raise_for_status()
    data = response.json()
    results = [_map_result(p) for p in data.get("results", [])]
    _cache_set(query, results)
    return results


def search_photos(keywords: list[str], per_page: int = 9) -> tuple[list[dict], bool]:
    """키워드로 사진을 검색한다. 결과가 부족하면 키워드를 줄여 재검색한다 (Reflect 단계, 최대 2회).

    반환값: (사진 목록, fallback 여부 — 재검색을 거쳤는지)
    """
    if not keywords:
        raise UnsplashError("키워드가 없습니다.")

    fallback = False
    top_n = min(3, len(keywords))

    for attempt in range(3):
        query = build_query(keywords, top_n=top_n)
        try:
            results = _search(query, per_page)
        except httpx.HTTPError as exc:
            raise UnsplashError(f"Unsplash API 호출 실패: {exc}") from exc

        if len(results) >= MIN_ACCEPTABLE_RESULTS or top_n <= 1:
            return results, fallback

        fallback = True
        top_n -= 1

    return results, fallback
