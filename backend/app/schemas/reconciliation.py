from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class OverallStatus(str, Enum):
    PASSED = "PASSED"
    PASSED_WITH_WARNINGS = "PASSED_WITH_WARNINGS"
    FAILED = "FAILED"


class PrimaryRecordStatus(str, Enum):
    MATCHED = "MATCHED"
    MISMATCHED = "MISMATCHED"
    MISSING_IN_DESTINATION = "MISSING_IN_DESTINATION"
    UNEXPECTED_IN_DESTINATION = "UNEXPECTED_IN_DESTINATION"
    DUPLICATE = "DUPLICATE"
    INVALID = "INVALID"


class ValidationOptionsSchema(BaseModel):
    case_insensitive: bool = False
    trim_whitespace: bool = True
    normalize_numbers: bool = True
    normalize_dates: bool = False
    date_format: str = "%Y-%m-%d"
    numeric_tolerance: str = "0.01"
    detect_missing: bool = True
    detect_unexpected: bool = True
    detect_duplicates: bool = True
    validate_required: bool = True
    validate_non_empty: bool = True
    validate_numeric: bool = True
    validate_email: bool = True


class FieldMappingSchema(BaseModel):
    source_column: str = ""
    destination_column: str = ""
    data_type: str = "string"
    required: bool = False


class ReconciliationConfigSchema(BaseModel):
    unique_key_source: str = ""
    unique_key_destination: str = ""
    field_mappings: List[FieldMappingSchema] = Field(default_factory=list)
    validation_options: ValidationOptionsSchema = Field(default_factory=ValidationOptionsSchema)


class ConfigValidationResponse(BaseModel):
    valid: bool = True
    errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)


class FieldComparisonSchema(BaseModel):
    field_label: str = ""
    source_column: str = ""
    destination_column: str = ""
    source_raw: Optional[str] = None
    destination_raw: Optional[str] = None
    source_normalized: Optional[str] = None
    destination_normalized: Optional[str] = None
    difference: Optional[str] = None
    matched: bool = True
    issues: List[str] = Field(default_factory=list)


class RecordResultSchema(BaseModel):
    record_id: str = ""
    primary_status: PrimaryRecordStatus = PrimaryRecordStatus.MATCHED
    issue_count: int = 0
    issue_types: List[str] = Field(default_factory=list)
    source_summary: str = ""
    destination_summary: str = ""
    source_values: Dict[str, Any] = Field(default_factory=dict)
    destination_values: Dict[str, Any] = Field(default_factory=dict)
    field_comparisons: List[FieldComparisonSchema] = Field(default_factory=list)
    validation_reasons: List[str] = Field(default_factory=list)


class RunReconciliationResponse(BaseModel):
    session_id: str = ""
    overall_validation_status: OverallStatus = OverallStatus.PASSED
    match_percentage: float = 0.0
    source_row_count: int = 0
    destination_row_count: int = 0
    matched_count: int = 0
    mismatched_count: int = 0
    missing_count: int = 0
    unexpected_count: int = 0
    duplicate_count: int = 0
    invalid_count: int = 0
    total_issues: int = 0
    duration_ms: float = 0.0
    records: List[RecordResultSchema] = Field(default_factory=list)
