from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import User
from app.schemas.user import Token, UserCreate, UserLogin, UserResponse, UserUpdate
from app.services.activity_service import record_activity

router = APIRouter()


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(
    user_in: UserCreate,
    db: Session = Depends(get_db),
) -> Any:
    """Registers a new user and returns an authentication token."""
    existing = db.scalar(select(User).where(User.email == user_in.email.lower().strip()))
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe uma conta cadastrada com este e-mail.",
        )

    user = User(
        email=user_in.email.lower().strip(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name.strip(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Record welcome activity
    record_activity(
        db,
        user_id=user.id,
        activity_type="account_created",
        metadata_json={"email": user.email},
    )
    db.commit()

    access_token = create_access_token(subject=user.id)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=Token)
def login(
    user_in: UserLogin,
    db: Session = Depends(get_db),
) -> Any:
    """Authenticates a user with JSON body and returns an access token."""
    user = db.scalar(select(User).where(User.email == user_in.email.lower().strip()))
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Esta conta de usuário está desativada.",
        )

    access_token = create_access_token(subject=user.id)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post("/login/oauth2", response_model=Token)
def login_oauth2(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> Any:
    """OAuth2 compatible token login for Swagger UI / OpenAPI docs."""
    user = db.scalar(select(User).where(User.email == form_data.username.lower().strip()))
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(subject=user.id)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    current_user: User = Depends(get_current_user),
) -> Any:
    """Returns profile information for the authenticated user."""
    return UserResponse.model_validate(current_user)


@router.put("/me", response_model=UserResponse)
def update_profile(
    update_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Updates the authenticated user's profile."""
    if update_in.full_name is not None:
        current_user.full_name = update_in.full_name.strip()
    if update_in.avatar_url is not None:
        current_user.avatar_url = update_in.avatar_url
    if update_in.password is not None:
        current_user.hashed_password = get_password_hash(update_in.password)

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.post("/logout")
def logout(
    current_user: User = Depends(get_current_user),
) -> Any:
    """Logs out the user (client invalidates token)."""
    return {"message": "Sessão encerrada com sucesso."}
