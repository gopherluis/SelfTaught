from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings

database_url = settings.DATABASE_URL

connect_args = {}

if database_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False
    database_url = database_url.replace(
        "sqlite+aiosqlite://", "sqlite://"
    )

engine = create_engine(
    database_url,
    connect_args=connect_args,
    echo=False,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()