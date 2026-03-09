from __future__ import annotations

import shutil
import subprocess
from pathlib import Path


def optimize_image(
    input_path: Path,
    output_path: Path,
    max_width: int = 1280,
    quality: int = 3,
) -> Path:
    """Resize, compress, and standardize product image dimensions."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    command = [
        "ffmpeg",
        "-y",
        "-i",
        str(input_path),
        "-vf",
        f"scale='min({max_width},iw)':-2",
        "-q:v",
        str(quality),
        str(output_path),
    ]
    if not _run_command(command):
        shutil.copy2(input_path, output_path)
    return output_path


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
