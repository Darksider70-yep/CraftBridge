import shutil
import subprocess
from pathlib import Path
from uuid import uuid4
import magic
from fastapi import HTTPException, UploadFile, status

from core.config.settings import get_settings

settings = get_settings()

ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"]
ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime"]
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100 MB


class S3CompatibleStorage:
    """S3-compatible URL emitter backed by local filesystem storage."""

    def __init__(self, bucket: str, base_url: str) -> None:
        self.bucket = bucket
        self.base_url = base_url.rstrip("/")
        self.storage_root = Path(settings.storage_root)
        self.images_dir = self.storage_root / "images"
        self.videos_dir = self.storage_root / "videos"
        self.thumbnails_dir = self.storage_root / "thumbnails"
        self.temp_dir = self.storage_root / "tmp"
        for directory in (
            self.images_dir,
            self.videos_dir,
            self.thumbnails_dir,
            self.temp_dir,
        ):
            directory.mkdir(parents=True, exist_ok=True)

    async def _validate_file(self, file: UploadFile, allowed_types: list[str]) -> bytes:
        file_bytes = await file.read()
        if len(file_bytes) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File size exceeds the limit of {MAX_FILE_SIZE // 1024 // 1024} MB.",
            )

        mime_type = magic.from_buffer(file_bytes, mime=True)
        if mime_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"File type '{mime_type}' is not allowed.",
            )
        await file.seek(0)
        return file_bytes

    async def upload_file(self, file: UploadFile, folder: str) -> str:
        if folder in {"reels", "videos"}:
            result = await self.upload_video(file=file)
            return result["video_url"]
        return await self.upload_image(file=file)

    async def upload_image(self, file: UploadFile) -> str:
        self._ensure_directories()
        file_bytes = await self._validate_file(file, ALLOWED_IMAGE_TYPES)
        extension = Path(file.filename or "").suffix.lower() or ".jpg"
        stem = str(uuid4())
        source_path = self.temp_dir / f"{stem}{extension}"
        optimized_path = self.images_dir / f"{stem}.jpg"

        source_path.write_bytes(file_bytes)
        await file.close()

        self._optimize_image(source_path=source_path, target_path=optimized_path)
        self._remove_if_exists(source_path)

        return self._build_public_url(f"images/{optimized_path.name}")

    async def upload_video(self, file: UploadFile) -> dict[str, str]:
        self._ensure_directories()
        file_bytes = await self._validate_file(file, ALLOWED_VIDEO_TYPES)
        extension = Path(file.filename or "").suffix.lower() or ".mp4"
        stem = str(uuid4())
        source_path = self.temp_dir / f"{stem}{extension}"
        target_video = self.videos_dir / f"{stem}.mp4"
        target_thumbnail = self.thumbnails_dir / f"{stem}.jpg"

        source_path.write_bytes(file_bytes)
        await file.close()

        self._transcode_video(source_path=source_path, target_path=target_video)
        self._generate_thumbnail(video_path=target_video, thumbnail_path=target_thumbnail)
        self._remove_if_exists(source_path)

        return {
            "video_url": self._build_public_url(f"videos/{target_video.name}"),
            "thumbnail_url": self._build_public_url(f"thumbnails/{target_thumbnail.name}"),
        }


    def _optimize_image(self, source_path: Path, target_path: Path) -> None:
        ffmpeg_cmd = [
            "ffmpeg",
            "-y",
            "-i",
            str(source_path),
            "-vf",
            "scale='min(1280,iw)':-2",
            "-q:v",
            "3",
            str(target_path),
        ]
        if not self._run_command(ffmpeg_cmd):
            shutil.copy2(source_path, target_path)

    def _transcode_video(self, source_path: Path, target_path: Path) -> None:
        ffmpeg_cmd = [
            "ffmpeg",
            "-y",
            "-i",
            str(source_path),
            "-vf",
            "scale=720:-2",
            "-c:v",
            "libx264",
            "-preset",
            "veryfast",
            "-crf",
            "28",
            "-c:a",
            "aac",
            "-b:a",
            "128k",
            str(target_path),
        ]
        if not self._run_command(ffmpeg_cmd):
            shutil.copy2(source_path, target_path)

    def _generate_thumbnail(self, video_path: Path, thumbnail_path: Path) -> None:
        ffmpeg_cmd = [
            "ffmpeg",
            "-y",
            "-i",
            str(video_path),
            "-ss",
            "00:00:01",
            "-frames:v",
            "1",
            "-vf",
            "scale=480:-2",
            str(thumbnail_path),
        ]
        if self._run_command(ffmpeg_cmd):
            return
        thumbnail_path.write_bytes(b"")

    def _run_command(self, command: list[str]) -> bool:
        try:
            subprocess.run(
                command,
                check=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
            return True
        except (FileNotFoundError, subprocess.CalledProcessError):
            return False

    def _build_public_url(self, object_key: str) -> str:
        if self.base_url.endswith("/storage"):
            return f"{self.base_url}/{object_key}"
        return f"{self.base_url}/{self.bucket}/{object_key}"

    @staticmethod
    def _remove_if_exists(path: Path) -> None:
        if path.exists():
            path.unlink()

    def _ensure_directories(self) -> None:
        for directory in (
            self.images_dir,
            self.videos_dir,
            self.thumbnails_dir,
            self.temp_dir,
        ):
            directory.mkdir(parents=True, exist_ok=True)


storage_client = S3CompatibleStorage(
    bucket=settings.storage_bucket,
    base_url=settings.storage_base_url,
)
