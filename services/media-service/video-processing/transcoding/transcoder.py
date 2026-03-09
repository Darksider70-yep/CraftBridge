from __future__ import annotations

import subprocess
from pathlib import Path


def transcode_video(input_path: Path, output_path: Path, resolution: str = "720:-2") -> Path:
    """Compress and normalize reel video to a standard resolution."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    command = [
        "ffmpeg",
        "-y",
        "-i",
        str(input_path),
        "-vf",
        f"scale={resolution}",
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
    if not _run_command(command):
        output_path.write_bytes(input_path.read_bytes())
    return output_path


def generate_preview_thumbnail(video_path: Path, thumbnail_path: Path) -> Path:
    """Generate one preview thumbnail for reel cards."""
    thumbnail_path.parent.mkdir(parents=True, exist_ok=True)
    command = [
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
    if not _run_command(command):
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
