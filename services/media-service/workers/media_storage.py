from __future__ import annotations

import os
import shutil
import subprocess
from pathlib import Path
from uuid import uuid4


STORAGE_ROOT = Path(os.getenv("MEDIA_STORAGE_ROOT", "/storage"))
IMAGES_DIR = STORAGE_ROOT / "images"
VIDEOS_DIR = STORAGE_ROOT / "videos"
THUMBNAILS_DIR = STORAGE_ROOT / "thumbnails"
TMP_DIR = STORAGE_ROOT / "tmp"

for directory in (IMAGES_DIR, VIDEOS_DIR, THUMBNAILS_DIR, TMP_DIR):
    directory.mkdir(parents=True, exist_ok=True)


def save_image(file_bytes: bytes, extension: str = ".jpg") -> Path:
    source_path = TMP_DIR / f"{uuid4()}{extension}"
    source_path.write_bytes(file_bytes)

    output_path = IMAGES_DIR / f"{source_path.stem}.jpg"
    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        str(source_path),
        "-vf",
        "scale='min(1280,iw)':-2",
        "-q:v",
        "3",
        str(output_path),
    ]
    if not _run_command(cmd):
        shutil.copy2(source_path, output_path)
    _cleanup(source_path)
    return output_path


def save_video(file_bytes: bytes, extension: str = ".mp4") -> Path:
    source_path = TMP_DIR / f"{uuid4()}{extension}"
    source_path.write_bytes(file_bytes)

    output_path = VIDEOS_DIR / f"{source_path.stem}.mp4"
    cmd = [
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
        str(output_path),
    ]
    if not _run_command(cmd):
        shutil.copy2(source_path, output_path)
    _cleanup(source_path)
    return output_path


def generate_thumbnail(video_path: Path) -> Path:
    thumbnail_path = THUMBNAILS_DIR / f"{video_path.stem}.jpg"
    cmd = [
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
    if not _run_command(cmd):
        thumbnail_path.write_bytes(b"")
    return thumbnail_path


def _run_command(command: list[str]) -> bool:
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


def _cleanup(path: Path) -> None:
    if path.exists():
        path.unlink()

