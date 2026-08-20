import os
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

from sqlalchemy import (
    create_engine, Column, String, Text, DateTime, Integer, JSON
)
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("DATABASE_URL")

# Railway gives postgres:// but SQLAlchemy 2.x wants postgresql://
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL, pool_pre_ping=True) if DATABASE_URL else None
SessionLocal = sessionmaker(bind=engine) if engine else None
Base = declarative_base()


# ── Cache table — used by extractor.py, jd_matcher.py, roadmap.py ──
class CacheEntry(Base):
    __tablename__ = "cache_entries"

    key = Column(String(80), primary_key=True)   # e.g. "jd_extract:<hash>"
    value = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)  # None = never expires


# ── Resume storage — tied to Google-login user_id ──
class StoredResume(Base):
    __tablename__ = "stored_resumes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(255), index=True, nullable=False)  # Google sub claim
    file_url = Column(String(500), nullable=True)               # S3/R2 URL to raw PDF
    extracted_data = Column(JSON, nullable=False)                # output of extract_skills()
    role = Column(String(50), nullable=True)
    track = Column(String(20), nullable=True)
    score = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


def init_db():
    """Call once on startup (main.py) to create tables if they don't exist."""
    if engine is None:
        print("WARNING: DATABASE_URL not set, DB features disabled.")
        return
    Base.metadata.create_all(engine)


# ── Cache get/set — pass these directly into extract_jd_requirements() etc ──

def cache_get(key: str):
    if SessionLocal is None:
        return None
    session = SessionLocal()
    try:
        entry = session.get(CacheEntry, key)
        if entry is None:
            return None
        if entry.expires_at and entry.expires_at < datetime.utcnow():
            session.delete(entry)
            session.commit()
            return None
        return entry.value
    except Exception as e:
        print(f"cache_get error: {e}")
        return None
    finally:
        session.close()


def cache_set(key: str, value: dict, ttl_days: int = 30):
    if SessionLocal is None:
        return
    session = SessionLocal()
    try:
        expires_at = datetime.utcnow() + timedelta(days=ttl_days) if ttl_days else None
        entry = session.get(CacheEntry, key)
        if entry:
            entry.value = value
            entry.expires_at = expires_at
        else:
            entry = CacheEntry(key=key, value=value, expires_at=expires_at)
            session.add(entry)
        session.commit()
    except Exception as e:
        print(f"cache_set error: {e}")
        session.rollback()
    finally:
        session.close()


# ── Resume storage helpers ──

def save_resume(user_id: str, extracted_data: dict, role: str = None,
                 track: str = None, score: float = None, file_url: str = None) -> int:
    if SessionLocal is None:
        return None
    session = SessionLocal()
    try:
        resume = StoredResume(
            user_id=user_id,
            extracted_data=extracted_data,
            role=role,
            track=track,
            score=int(score) if score is not None else None,
            file_url=file_url,
        )
        session.add(resume)
        session.commit()
        session.refresh(resume)
        return resume.id
    except Exception as e:
        print(f"save_resume error: {e}")
        session.rollback()
        return None
    finally:
        session.close()


def get_latest_resume(user_id: str):
    if SessionLocal is None:
        return None
    session = SessionLocal()
    try:
        resume = (
            session.query(StoredResume)
            .filter(StoredResume.user_id == user_id)
            .order_by(StoredResume.created_at.desc())
            .first()
        )
        if resume is None:
            return None
        return {
            "id": resume.id,
            "extracted_data": resume.extracted_data,
            "role": resume.role,
            "track": resume.track,
            "score": resume.score,
            "created_at": resume.created_at.isoformat(),
        }
    finally:
        session.close()