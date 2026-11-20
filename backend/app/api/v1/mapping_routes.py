from typing import Dict, List, Optional

from fastapi import APIRouter

from app.schemas.mapping import (
    MappingPreviewRequest,
    MappingPreviewResponse,
    MappingPreviewRowSchema,
)

router = APIRouter(prefix="/mapping", tags=["Mapping"])


def _project_rows(
    rows: List[Dict[str, str]],
    active_mappings: List[dict],
) -> List[MappingPreviewRowSchema]:
    projected: List[MappingPreviewRowSchema] = []
    for row in rows:
        mapped: Dict[str, Optional[str]] = {}
        missing_req: List[str] = []
        for m in active_mappings:
            src_col = m["source_column"]
            dst_col = m["destination_column"]
            req = m["required"]
            val = row.get(src_col)
            mapped[dst_col] = val if val is not None else ""
            if req and (val is None or str(val).strip() == ""):
                missing_req.append(dst_col)
        projected.append(
            MappingPreviewRowSchema(mapped_record=mapped, missing_required=missing_req)
        )
    return projected


@router.post("/preview", response_model=MappingPreviewResponse)
async def preview_mapping(payload: MappingPreviewRequest) -> MappingPreviewResponse:
    active = [
        {
            "source_column": m.source_column.strip(),
            "destination_column": m.destination_column.strip(),
            "data_type": m.data_type,
            "required": m.required,
        }
        for m in payload.field_mappings
        if m.source_column.strip() and m.destination_column.strip()
    ]

    return MappingPreviewResponse(
        source_preview=_project_rows(payload.sample_source_rows, active),
        destination_preview=_project_rows(payload.sample_destination_rows, active),
    )