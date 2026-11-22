from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.db import DbSession
from app.deps import CurrentUser
from app.models import User
from app.schemas.user import LoginIn, RegisterIn, TokenOut, UserOut
from app.security import create_access_token, hash_password, verify_password_constant_time

router = APIRouter(prefix="/auth", tags=["Авторизація"])


def _token_for(user: User) -> TokenOut:
    return TokenOut(access_token=create_access_token(user.id), user=UserOut.model_validate(user))


@router.post("/register", status_code=status.HTTP_201_CREATED, summary="Реєстрація")
def register(data: RegisterIn, db: DbSession) -> TokenOut:
    if db.scalar(select(User.id).where(User.email == data.email)) is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "Користувач з такою поштою вже існує")
    user = User(
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    return _token_for(user)


@router.post("/login", summary="Вхід")
def login(data: LoginIn, db: DbSession) -> TokenOut:
    user = db.scalar(select(User).where(User.email == data.email))
    if not verify_password_constant_time(data.password, user.password_hash if user else None):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Невірна пошта або пароль")
    return _token_for(user)


@router.get("/me", summary="Поточний користувач")
def me(user: CurrentUser) -> UserOut:
    return UserOut.model_validate(user)
