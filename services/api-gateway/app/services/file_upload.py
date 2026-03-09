from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from core.config.settings import get_settings

settings = get_settings()


class S3CompatibleStorage:
    """Placeholder S3-compatible storage client."""

    def __init__(self, bucket: str, base_url: str) -> None:
        self.bucket = bucket
        self.base_url = base_url.rstrip("/")

    async def upload_file(self, file: UploadFile, folder: str) -> str:
        extension = Path(file.filename or "").suffix
        object_key = f"{folder}/{uuid4()}{extension}"

        # Placeholder behavior for Phase 2: consume upload stream, return object URL.
        await file.read()
        await file.close()

        return f"{self.base_url}/{self.bucket}/{object_key}"


storage_client = S3CompatibleStorage(
    bucket=settings.storage_bucket,
    base_url=settings.storage_base_url,
)
