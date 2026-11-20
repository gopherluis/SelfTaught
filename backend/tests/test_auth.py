import pytest
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.api.v1.endpoints import auth
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserUpdate


def test_register_user_success(db_session: Session):
    user_in = UserCreate(
        email="newlearner@selftaught.dev",
        full_name="Jordan Smith",
        password="StrongPassword789",
    )
    token = auth.register(user_in=user_in, db=db_session)
    assert token.access_token is not None
    assert token.token_type == "bearer"
    assert token.user.email == "newlearner@selftaught.dev"
    assert token.user.full_name == "Jordan Smith"


def test_register_duplicate_email(db_session: Session, test_user: User):
    user_in = UserCreate(
        email=test_user.email,
        full_name="Duplicate Attempt",
        password="Password123",
    )
    with pytest.raises(HTTPException) as exc_info:
        auth.register(user_in=user_in, db=db_session)
    assert exc_info.value.status_code == 400
    assert "Já existe uma conta" in exc_info.value.detail


def test_login_success(db_session: Session, test_user: User):
    login_in = UserLogin(
        email="student@selftaught.dev",
        password="SecretPassword123",
    )
    token = auth.login(user_in=login_in, db=db_session)
    assert token.access_token is not None
    assert token.user.id == test_user.id


def test_login_invalid_password(db_session: Session, test_user: User):
    login_in = UserLogin(
        email="student@selftaught.dev",
        password="WrongPassword!",
    )
    with pytest.raises(HTTPException) as exc_info:
        auth.login(user_in=login_in, db=db_session)
    assert exc_info.value.status_code == 401
    assert "E-mail ou senha incorretos" in exc_info.value.detail


def test_get_current_user_profile(test_user: User):
    profile = auth.get_current_user_profile(current_user=test_user)
    assert profile.id == test_user.id
    assert profile.email == test_user.email
    assert profile.full_name == test_user.full_name


def test_update_profile(db_session: Session, test_user: User):
    update_in = UserUpdate(full_name="Alexander Rivera Jr.")
    updated = auth.update_profile(update_in=update_in, current_user=test_user, db=db_session)
    assert updated.full_name == "Alexander Rivera Jr."


def test_logout(test_user: User):
    res = auth.logout(current_user=test_user)
    assert "Sessão encerrada com sucesso" in res["message"]
