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
        "Copy backend/.env.example to backend/.env and fill in your PostgreSQL URL, e.g.:\n"
        "  ASYNC_DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/scms\n"
        "See README.md for full setup instructions."
    )

async_engine = create_async_engine(ASYNC_DATABASE_URL, echo=False)

async_session = sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()

SETUP_SQL_PATH = Path(__file__).parent / "setup.sql"


async def get_db():
    async with async_session() as session:
        yield session


async def init_db() -> None:
    """Idempotently create all SCMS tables from setup.sql.
    Uses raw asyncpg (not SQLAlchemy) because setup.sql contains multiple
    semicolon-separated statements — identical pattern to the reference project.
    """
    setup_sql = SETUP_SQL_PATH.read_text(encoding="utf-8")

    # asyncpg.connect() needs plain postgresql:// not postgresql+asyncpg://
    dsn = ASYNC_DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://", 1)

    conn = await asyncpg.connect(dsn)
    try:
        await conn.execute(setup_sql)
    finally:
        await conn.close()

    logger.info("Database schema verified / created (scms.*, public.*)")
