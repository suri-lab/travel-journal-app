import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from .database import Base


def new_journal_id() -> str:
    return f"j_{uuid.uuid4().hex[:8]}"


class Journal(Base):
    __tablename__ = "journals"

    journal_id = Column(String, primary_key=True, default=new_journal_id)
    user_id = Column(String, nullable=True)
    text = Column(Text, nullable=False)
    location = Column(String, nullable=True)
    travel_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    photo = relationship("Photo", back_populates="journal", uselist=False, cascade="all, delete-orphan")
    keywords = relationship("Keyword", back_populates="journal", cascade="all, delete-orphan")


class Photo(Base):
    __tablename__ = "photos"

    photo_id = Column(String, primary_key=True)
    journal_id = Column(String, ForeignKey("journals.journal_id"), nullable=False)
    full_url = Column(String, nullable=False)
    thumb_url = Column(String, nullable=True)
    photographer = Column(String, nullable=False)
    photographer_url = Column(String, nullable=False)

    journal = relationship("Journal", back_populates="photo")


class Keyword(Base):
    __tablename__ = "keywords"

    keyword_id = Column(Integer, primary_key=True, autoincrement=True)
    journal_id = Column(String, ForeignKey("journals.journal_id"), nullable=False)
    keyword = Column(String, nullable=False)
    category = Column(String, nullable=True)

    journal = relationship("Journal", back_populates="keywords")
