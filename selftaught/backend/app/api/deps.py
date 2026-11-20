from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais de autenticação",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if not payload:
        raise credentials_exception
    user_id: Optional[str] = payload.get("sub")
    if not user_id:
        raise credentials_exception

    stmt = select(User).where(User.id == user_id)
    user = db.scalar(stmt)

    if not user:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Conta de usuário inativa",
        )
    return user
