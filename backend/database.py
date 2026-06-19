import os
import logging
from pathlib import Path

import asyncpg
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

logger = logging.getLogger(__name__)

load_dotenv(Path(__file__).parent / ".env")

ASYNC_DATABASE_URL = os.getenv("ASYNC_DATABASE_URL")

if not ASYNC_DATABASE_URL:
    raise RuntimeError(
        "ASYNC_DATABASE_URL is not set.\n"
        "Copy backend/.env.example to backend/.env and point it at your "
        "PostgreSQL instance, e.g.:\n"
        "  ASYNC_DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/scms\n"
        "See README.md for full setup instructions."
    )

async_engine = create_async_engine(ASYNC_DATABASE_URL, echo=False)

async_session = sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()

# Path to the SQL file that creates the scms schema, tables, indexes, and the
# pg_notify trigger. Executed once at startup so the app works against a
# fresh database with zero manual steps.
SETUP_SQL_PATH = Path(__file__).parent / "setup.sql"


async def get_db():
    async with async_session() as session:
        yield session


_NOTIFICATIONS_SQL = """
CREATE TABLE IF NOT EXISTS public.notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id          INTEGER NOT NULL,
    message          TEXT NOT NULL,
    is_read          BOOLEAN NOT NULL DEFAULT FALSE,
    created_on       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
"""


async def init_db() -> None:
    """Idempotently create everything the app needs: the scms schema/tables
    (from setup.sql) and the public.notifications table the notification
    backend reads from. Safe to run on every startup.

    Uses a raw asyncpg connection (not the SQLAlchemy engine) because
    setup.sql contains multiple statements separated by semicolons, and
    asyncpg's prepared-statement execute path (which SQLAlchemy's
    create_async_engine uses) cannot run more than one command at a time.
    """
    setup_sql = SETUP_SQL_PATH.read_text()
    # asyncpg.connect() wants a plain "postgresql://" DSN, not the
    # SQLAlchemy "postgresql+asyncpg://" URL.
    dsn = ASYNC_DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://", 1)

    conn = await asyncpg.connect(dsn)
    try:
        await conn.execute(setup_sql)
        # public.notifications is normally owned by the separate real-time
        # notification backend, but we create it here too (IF NOT EXISTS)
        # so this service is fully self-contained and never silently drops
        # notifications just because that other service hasn't run yet.
        await conn.execute(_NOTIFICATIONS_SQL)
    finally:
        await conn.close()

    logger.info("Database schema verified/created (scms.*, public.notifications)")
