from typing import List, Literal
from pydantic import BaseModel, Field

InferredFieldType = Literal["string", "number", "currency", "date", "email", "boolean"]


class ColumnStatSchema(BaseModel):
    column: str
    missing_count: int = Field(ge=0)
    unique_count: int = Field(ge=0)
    inferred_type: InferredFieldType = "string"
    sample_values: List[str] = Field(default_factory=list)


class CsvPreviewResponse(BaseModel):
    file_name: str
    file_size_bytes: int = Field(ge=0)
    row_count: int = Field(ge=0)
    headers: List[str]
    sample_rows: List[dict[str, str]]
    column_stats: List[ColumnStatSchema]
    encoding_used: str


class CsvValidationResponse(BaseModel):
    valid: bool
    file_name: str
    file_size_bytes: int = Field(ge=0)
    row_count: int = Field(ge=0)
    headers: List[str]
    warnings: List[str] = Field(default_factory=list)
    errors: List[str] = Field(default_factory=list)