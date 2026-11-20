import shutil
import uuid
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

from fastapi import UploadFile

from app.core.config import settings
from app.core.exceptions import InvalidFileError, PayloadTooLargeError
from app.core.security import ensure_within_directory, sanitize_filename


@contextmanager
def temporary_upload_file(upload: UploadFile, max_bytes: int | None = None) -> Iterator[Path]:
    limit = max_bytes if max_bytes is not None else settings.max_upload_size_bytes
    safe_name = sanitize_filename(upload.filename)
    if not safe_name.lower().endswith(".csv"):
        raise InvalidFileError("Unsupported file format. Only .csv files are accepted.")

    root = settings.temp_root_path
    root.mkdir(parents=True, exist_ok=True)
    batch_dir = ensure_within_directory(root / f"job_{uuid.uuid4().hex}", root)
    batch_dir.mkdir(parents=True, exist_ok=False)
    dest_path = ensure_within_directory(batch_dir / safe_name, batch_dir)

    total_written = 0
    chunk_size = 1024 * 256

    try:
        with dest_path.open("wb") as out_file:
            while True:
                chunk = upload.file.read(chunk_size)
                if not chunk:
                    break
                total_written += len(chunk)
                if total_written > limit:
                    raise PayloadTooLargeError(
                        f"File '{safe_name}' exceeds maximum size of {settings.MAX_UPLOAD_SIZE_MB} MB."
                    )
                out_file.write(chunk)

        if total_written == 0:
            raise InvalidFileError(f"Uploaded file '{safe_name}' is empty (0 bytes).")

        yield dest_path
    finally:
        try:
            upload.file.close()
        except Exception:
            pass
        if batch_dir.exists():
            shutil.rmtree(batch_dir, ignore_errors=True)