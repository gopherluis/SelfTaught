from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from app.core.config import settings

# Engine configuration
connect_args = {}
# Resolve SQLite path relative to the project root directory
import os
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
# If using SQLite, ensure the database file is inside the project root and create it if missing
if settings.DATABASE_URL.startswith("sqlite"):
    db_path = os.path.join(project_root, "selftaught.db")
    # Ensure the directory exists (project root does) and the file exists
    if not os.path.exists(db_path):
        open(db_path, "a").close()
    database_url = f"sqlite:///{db_path}"
else:
    database_url = settings.DATABASE_URL
if database_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False
    # If async sqlite was in the env, strip async prefix
    database_url = database_url.replace("sqlite+aiosqlite://", "sqlite://")

engine = create_engine(
    database_url,
    connect_args=connect_args,
    echo=False,
)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency providing a transactional database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
