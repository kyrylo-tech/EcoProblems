from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BACKEND_DIR.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=BACKEND_DIR / ".env", extra="ignore")

    app_name: str = "Eco Guard API"
    debug: bool = False

    # SQLite and uploaded photos live in the project root (next to backend/ and frontend/)
    database_url: str = f"sqlite:///{(PROJECT_ROOT / 'ecoproblems.db').as_posix()}"
    media_dir: Path = PROJECT_ROOT / "uploads"
    media_url_prefix: str = "/api/media"

    cors_origins: list[str] = ["http://localhost:3000"]

    # Auth
    secret_key: str = "dev-secret-change-me-in-production-please-32b"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7

    # Photos
    max_photos_per_point: int = 10
    max_photo_size_mb: int = 10

    # Reverse geocoding (OpenStreetMap Nominatim)
    geocoder_url: str = "https://nominatim.openstreetmap.org/reverse"
    geocoder_user_agent: str = "EcoGuard/0.1"
    geocoder_timeout_seconds: float = 5.0


settings = Settings()
