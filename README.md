# 여행 저널 웹앱

여행 글을 쓰면 AI가 핵심 키워드를 추출하고 Unsplash에서 어울리는 사진을 추천해, 글과 사진을 결합한
여행일지 카드를 만들고 타임라인으로 누적하는 웹앱입니다.

기술명세서: [`여행저널웹앱_기술명세서_v1.0.pdf`](../여행저널웹앱_기술명세서_v1.0.pdf) 참고.

## 구성

- `backend/` — FastAPI + SQLAlchemy (SQLite) + OpenAI API + Unsplash API
- `frontend/` — React 18 + Vite + Tailwind CSS

## 로컬 실행

### 백엔드

```bash
cd backend
python -m venv venv
./venv/Scripts/pip install -r requirements.txt   # macOS/Linux: venv/bin/pip
cp .env.example .env   # OPENAI_API_KEY, UNSPLASH_ACCESS_KEY 채우기
./venv/Scripts/python -m uvicorn app.main:app --reload --port 8000
```

### 프론트엔드

```bash
cd frontend
npm install
npm run dev
```

`http://localhost:5173` 접속 (Vite 프록시로 `/api` 요청이 `localhost:8000`으로 전달됩니다).

## 배포

- 프론트엔드: Vercel (정적 빌드, `VITE_API_BASE_URL` 환경변수로 백엔드 URL 지정)
- 백엔드: Render (`render.yaml` 블루프린트, `OPENAI_API_KEY`/`UNSPLASH_ACCESS_KEY`/`CORS_ORIGINS` 환경변수 설정 필요)

## API 키 발급

- OpenAI: https://platform.openai.com/api-keys
- Unsplash: https://unsplash.com/developers (Demo 등급: 시간당 50 요청 제한)
