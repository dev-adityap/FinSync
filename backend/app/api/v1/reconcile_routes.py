import json
import uuid

from fastapi import APIRouter, File, Form, UploadFile
from pydantic import ValidationError

from app.core.exceptions import ConfigurationValidationError
from app.schemas.reconciliation import (
    ConfigValidationResponse,
    ReconciliationConfigSchema,
    RunReconciliationResponse,
)
from app.services.reconciliation_engine import (
    run_reconciliation_engine,
    validate_reconciliation_config_dict,
)
from app.services.temp_file_manager import temporary_upload_file

router = APIRouter(prefix="/reconciliation", tags=["Reconciliation"])


@router.post("/validate-config", response_model=ConfigValidationResponse)
async def validate_config(config: ReconciliationConfigSchema) -> ConfigValidationResponse:
    errors, warnings = validate_reconciliation_config_dict(config.model_dump())
    return ConfigValidationResponse(
        valid=len(errors) == 0,
        errors=errors,
        warnings=warnings,
    )


@router.post("/run", response_model=RunReconciliationResponse)
async def run_reconciliation(
    source_file: UploadFile = File(...),
    destination_file: UploadFile = File(...),
    config_json: str = Form(...),
    session_id: str = Form(default=""),
) -> RunReconciliationResponse:
    try:
        parsed_raw = json.loads(config_json)
        validated_cfg = ReconciliationConfigSchema.model_validate(parsed_raw)
    except (json.JSONDecodeError, ValidationError) as exc:
        raise ConfigurationValidationError(f"Invalid reconciliation configuration payload: {exc}") from exc

    resolved_session_id = session_id.strip() or uuid.uuid4().hex

    with (
        temporary_upload_file(source_file) as src_path,
        temporary_upload_file(destination_file) as dst_path,
    ):
        outcome = run_reconciliation_engine(
            session_id=resolved_session_id,
            source_path=src_path,
            destination_path=dst_path,
            config=validated_cfg.model_dump(),
        )
        return RunReconciliationResponse(**outcome)