from typing import Generator
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool
from app.core.database import Base
from app.core.security import get_password_hash
from app.models.user import User

TEST_DB_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestSessionLocal = sessionmaker(
    bind=test_engine,
    autocommit=False,
    autoflush=False,
)


@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    Base.metadata.create_all(bind=test_engine)
    session = TestSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def test_user(db_session: Session) -> User:
    """Primary test user."""
    user = User(
        email="student@selftaught.dev",
        hashed_password=get_password_hash("SecretPassword123"),
        full_name="Alex Rivera",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture(scope="function")
def second_user(db_session: Session) -> User:
    """Second user for testing data isolation and permissions."""
    user = User(
        email="other@selftaught.dev",
        hashed_password=get_password_hash("SecretPassword456"),
        full_name="Morgan Lee",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user
