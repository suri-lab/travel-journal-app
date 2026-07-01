import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import Base, engine
from .routers import journal, photos

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Travel Journal API", version="1.0")

cors_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]
print(f"[startup] CORS allowed origins: {cors_origins!r}")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(journal.router)
app.include_router(photos.router)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/debug/cors")
def debug_cors():
    return {"raw_env": os.getenv("CORS_ORIGINS"), "parsed": cors_origins}
