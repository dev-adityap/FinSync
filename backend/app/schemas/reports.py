from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ReportRecordPayload(BaseModel):
    record_id: str = ""
    primary_status: str = ""
    issue_count: int = 0
    issue_types: List[str] = Field(default_factory=list)
    source_summary: str = ""
    destination_summary: str = ""
    field_comparisons: List[Dict[str, Any]] = Field(default_factory=list)
    validation_reasons: List[str] = Field(default_factory=list)


class ReportExportPayload(BaseModel):
    session_name: Optional[str] = None
    records: List[ReportRecordPayload] = Field(default_factory=list)