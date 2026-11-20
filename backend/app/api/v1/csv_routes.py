from fastapi import APIRouter, File, Form, UploadFile

from app.services.csv_parser import build_csv_preview, validate_csv_structure
from app.services.temp_file_manager import temporary_upload_file

router = APIRouter(prefix="/csv", tags=["CSV"])


@router.post("/preview")
async def preview_csv(
    file: UploadFile = File(...),
    preview_limit: int = Form(10),
) -> dict:
    with temporary_upload_file(file) as path:
        result = build_csv_preview(path, path.stat().st_size, preview_limit)
    return result


@router.post("/validate")
async def validate_csv(file: UploadFile = File(...)) -> dict:
    with temporary_upload_file(file) as path:
        result = validate_csv_structure(path, path.stat().st_size)
    return result
