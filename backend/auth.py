import os
from datetime import datetime
from typing import Optional

from fastapi import Header, HTTPException
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

_engine = create_engine(DATABASE_URL, pool_pre_ping=True) if DATABASE_URL else None
_Session = sessionmaker(bind=_engine) if _engine else None


class CurrentUser:
    def __init__(self, user_id: str, email: str, name: Optional[str] = None):
        self.user_id = user_id
        self.email = email
        self.name = name


def _lookup_session(session_token: str) -> Optional[dict]:
    """
    Looks up the session directly in NextAuth's own tables (created by
    the Prisma/Postgres adapter using the database session strategy):

      Session(id, sessionToken, userId, expires)
      User(id, name, email, image)

    Table/column names follow NextAuth's default Prisma schema casing.
    Adjust the quoted identifiers below if your adapter/migration used
    different casing (e.g. snake_case).
    """
    if _Session is None:
        raise HTTPException(status_code=500, detail="DATABASE_URL not configured on backend")

    db = _Session()
    try:
        row = db.execute(
            text("""
                SELECT s."userId", s.expires, u.email, u.name
                FROM "Session" s
                JOIN "User" u ON u.id = s."userId"
                WHERE s."sessionToken" = :token
            """),
            {"token": session_token},
        ).fetchone()

        if row is None:
            return None

        user_id, expires, email, name = row

        if expires and expires < datetime.utcnow():
            return None

        return {"user_id": user_id, "email": email, "name": name}
    finally:
        db.close()


async def get_current_user(authorization: Optional[str] = Header(None)) -> CurrentUser:
    """
    FastAPI dependency for protected routes:

        @app.post("/save-resume")
        async def save(..., user: CurrentUser = Depends(get_current_user)):
            ...

    Frontend sends the NextAuth session token as:
        Authorization: Bearer <sessionToken>

    (With the database strategy, NextAuth's session cookie value IS the
    sessionToken stored in the Session table — send that exact value.)
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = authorization.removeprefix("Bearer ").strip()
    session = _lookup_session(token)

    if session is None:
        raise HTTPException(status_code=401, detail="Invalid or expired session")

    return CurrentUser(
        user_id=session["user_id"],
        email=session["email"],
        name=session["name"],
    )


async def get_current_user_optional(authorization: Optional[str] = Header(None)) -> Optional[CurrentUser]:
    """
    Same as get_current_user but returns None instead of raising when no
    valid session is present. Use for routes that work both logged-out
    and logged-in (e.g. /analyze stays anonymous-first, but auto-saves
    the resume if the user happens to be logged in).
    """
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        return await get_current_user(authorization)
    except HTTPException:
        return None


def get_user_count() -> int:
    """Quick helper for tracking total signups, e.g. for an internal metrics view."""
    if _Session is None:
        return 0
    db = _Session()
    try:
        result = db.execute(text('SELECT COUNT(*) FROM "User"')).scalar()
        return result or 0
    finally:
        db.close()