from datetime import timedelta
from functools import cache

import jwt
from pwdlib import PasswordHash

from app.config import settings
from app.db import utcnow

_hasher = PasswordHash.recommended()  # argon2id


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return _hasher.verify(password, password_hash)


@cache
def _dummy_hash() -> str:
    return hash_password("timing-attack-dummy")


def verify_password_constant_time(password: str, password_hash: str | None) -> bool:
    """Spend the same time whether the user exists or not."""
    if password_hash is None:
        _hasher.verify(password, _dummy_hash())
        return False
    return verify_password(password, password_hash)


def create_access_token(user_id: int) -> str:
    now = utcnow()
    payload = {
        "sub": str(user_id),
        "iat": now,
        "exp": now + timedelta(minutes=settings.access_token_expire_minutes),
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> int | None:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])
        return int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        return None
