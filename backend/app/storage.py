"""Photo files on disk under settings.media_dir, served at settings.media_url_prefix."""

import logging
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from app.config import settings

log = logging.getLogger(__name__)


def _detect_image_ext(head: bytes) -> str | None:
    if head.startswith(b"\xff\xd8\xff"):
        return "jpg"
    if head.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"
    if head[:4] == b"RIFF" and head[8:12] == b"WEBP":
        return "webp"
    return None


def save_point_photo(point_id: int, upload: UploadFile) -> str:
    """Validate and store an uploaded image. Returns its path relative to media_dir."""
    max_bytes = settings.max_photo_size_mb * 1024 * 1024
    data = upload.file.read(max_bytes + 1)
    if len(data) > max_bytes:
        raise HTTPException(
            status.HTTP_413_CONTENT_TOO_LARGE,
            f"Файл «{upload.filename}» завеликий (максимум {settings.max_photo_size_mb} МБ)",
        )
    ext = _detect_image_ext(data[:16])
    if ext is None:
        raise HTTPException(
            status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            f"Файл «{upload.filename}» не є зображенням JPEG, PNG або WebP",
        )

    relative = Path("points") / str(point_id) / f"{uuid.uuid4().hex}.{ext}"
    target = settings.media_dir / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(data)
    return relative.as_posix()


def delete_media(relative_path: str) -> None:
    target = settings.media_dir / relative_path
    try:
        target.unlink(missing_ok=True)
        if target.parent != settings.media_dir and not any(target.parent.iterdir()):
            target.parent.rmdir()
    except OSError as exc:
        log.warning("Could not delete media file %s: %s", target, exc)


def media_url(relative_path: str) -> str:
    return f"{settings.media_url_prefix}/{relative_path}"
