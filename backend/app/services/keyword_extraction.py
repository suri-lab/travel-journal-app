import json
import os

from openai import OpenAI

SYSTEM_PROMPT_V1_2 = """[Role]
당신은 여행 글에서 사진 검색에 적합한 핵심 키워드를 추출하는 전문 어시스턴트입니다.

[Context]
사용자는 여행작가이며, 200~1000자 분량의 짧은 여행 글을 작성합니다.
이 키워드는 Unsplash 사진 검색 API의 검색어로 사용됩니다.

[Instruction]
1) 글에서 장소, 자연물/사물, 계절/시간, 감정/분위기를 각각 파악하세요.
2) 영어 검색어로도 변환 가능한, 시각적으로 구체적인 명사·형용사 위주로
   5~8개의 키워드를 선정하세요. (예: '슬픔' 같은 추상 감정 단독 사용 금지,
   'melancholic sunset' 처럼 시각화 가능한 조합으로 변환)
3) 지나치게 일반적인 단어('여행', '사진')는 제외하세요.
4) 근거 없는 장소·계절을 추측하지 말고, 글에 명시되지 않았다면 category_tags의
   해당 필드를 null로 두세요.
5) 모든 키워드는 영어로 작성하세요 (Unsplash 검색 정확도를 위해).

[Format]
반드시 아래 JSON 형식으로만 응답하세요 (설명 텍스트 금지):
{ "keywords": string[5~8], "category_tags": { "place": string|null,
  "mood": string|null, "time": string|null } }

[Example]
입력: '제주 애월 바닷가에서 노을을 보며 걸었다. 파도 소리와 붉은 하늘이...'
출력: {"keywords": ["Jeju coastline", "sunset", "ocean waves", "beach walk",
  "orange sky", "evening sea"], "category_tags": {"place": "제주 애월",
  "mood": "평온함", "time": "노을/저녁"}}
"""

MAX_KEYWORDS = 8
MIN_KEYWORDS = 5


class KeywordExtractionError(Exception):
    pass


def _client() -> OpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise KeywordExtractionError("OPENAI_API_KEY가 설정되지 않았습니다.")
    return OpenAI(api_key=api_key)


def extract_keywords(text: str) -> dict:
    client = _client()
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT_V1_2},
            {"role": "user", "content": text},
        ],
        temperature=0.3,
    )
    content = response.choices[0].message.content
    data = json.loads(content)

    keywords = data.get("keywords", [])[:MAX_KEYWORDS]
    category_tags = data.get("category_tags", {}) or {}

    return {
        "keywords": keywords,
        "category_tags": {
            "place": category_tags.get("place"),
            "mood": category_tags.get("mood"),
            "time": category_tags.get("time"),
        },
    }
