from typing import Dict, List, Literal, Optional
from pydantic import BaseModel, Field

FieldDataType = Literal["string", "number", "currency", "date", "email", "boolean"]


class FieldMappingSchema(BaseModel):
    source_column: str = Field(min_length=1)
    destination_column: str = ""
    data_type: FieldDataType = "string"
    required: bool = False


class MappingPreviewRequest(BaseModel):
    sample_source_rows: List[Dict[str, str]] = Field(default_factory=list, max_length=200)
    sample_destination_rows: List[Dict[str, str]] = Field(default_factory=list, max_length=200)
    field_mappings: List[FieldMappingSchema] = Field(default_factory=list)


class MappingPreviewRowSchema(BaseModel):
    mapped_record: Dict[str, Optional[str]]
    missing_required: List[str] = Field(default_factory=list)


class MappingPreviewResponse(BaseModel):
    source_preview: List[MappingPreviewRowSchema]
    destination_preview: List[MappingPreviewRowSchema]