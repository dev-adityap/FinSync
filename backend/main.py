from fastapi import FastAPI, UploadFile, File, HTTPException, Query, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import pandas as pd
import io
import os
import tempfile
import uuid
import time
from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP
import re
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="FinSync API",
    description="Intelligent Data Integration & Migration Validator API",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Configuration
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB
ALLOWED_EXTENSIONS = {".csv"}


# Pydantic models
class ColumnMapping(BaseModel):
    sourceColumn: str
    destinationColumn: str
    dataType: str = "string"
    isUniqueIdentifier: bool = False
    isRequired: bool = False


class ValidationConfig(BaseModel):
    caseInsensitive: bool = True
    trimWhitespace: bool = True
    normalizeNumbers: bool = True
    normalizeDates: bool = False
    numericTolerance: float = 0.01
    detectMissing: bool = True
    detectUnexpected: bool = True
    detectDuplicates: bool = True
    requiredFields: List[str] = []
    emptyValues: List[str] = ["", "null", "NULL", "N/A", "n/a"]
    validateEmails: bool = False
    dateFormat: Optional[str] = None


class ReconciliationConfig(BaseModel):
    columnMappings: List[ColumnMapping]
    uniqueIdentifier: str
    validation: ValidationConfig


class ReconciliationRunRequest(BaseModel):
    sourceFile: str  # temp file path
    destinationFile: str  # temp file path
    config: ReconciliationConfig


class FieldComparison(BaseModel):
    field: str
    sourceValue: Any
    destinationValue: Any
    normalizedSource: Any
    normalizedDestination: Any
    match: bool
    difference: Optional[float] = None


class ValidationIssue(BaseModel):
    id: str
    recordId: str
    field: str
    type: str
    severity: str = "error"
    message: str
    sourceValue: Optional[Any] = None
    destinationValue: Optional[Any] = None


class ReconciliationRecord(BaseModel):
    id: str
    recordId: str
    primaryStatus: str
    issueCount: int
    sourceData: Dict[str, Any]
    destinationData: Dict[str, Any]
    normalizedSource: Dict[str, Any]
    normalizedDestination: Dict[str, Any]
    fieldComparisons: List[FieldComparison]
    issues: List[ValidationIssue]


class ReconciliationMetrics(BaseModel):
    sourceRows: int
    destinationRows: int
    matched: int
    mismatched: int
    missing: int
    unexpected: int
    duplicate: int
    invalid: int
    totalIssues: int
    matchPercentage: float


class ReconciliationResults(BaseModel):
    metrics: ReconciliationMetrics
    records: List[ReconciliationRecord]
    issues: List[ValidationIssue]
    duration: float
    status: str


class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: str


class CSVPreviewResponse(BaseModel):
    headers: List[str]
    preview: List[Dict[str, Any]]
    rowCount: int
    encoding: str
    errors: List[str]


# Temporary file storage
temp_files: Dict[str, str] = {}


# Utility functions
def read_csv_safe(file_content: bytes, filename: str) -> pd.DataFrame:
    """Read CSV with encoding fallback."""
    encodings = ["utf-8", "latin-1", "cp1252", "iso-8859-1"]
    last_error = None
    for enc in encodings:
        try:
            text = file_content.decode(enc)
            df = pd.read_csv(io.StringIO(text), dtype=str, keep_default_na=False)
            return df
        except Exception as e:
            last_error = e
    raise ValueError(f"Could not parse CSV file: {last_error}")


def clean_identifier(value: Any, trim: bool = True) -> str:
    """Clean identifier value preserving leading zeros."""
    if pd.isna(value) or value is None:
        return ""
    val = str(value).strip() if trim else str(value)
    return val


def normalize_value(value: Any, config: ValidationConfig, column: str) -> Any:
    """Normalize a value based on configuration."""
    if pd.isna(value) or value is None or value == "":
        return ""
    
    val = str(value)
    
    if config.trimWhitespace:
        val = val.strip()
    
    # Find the data type for this column from mappings
    # Default to string
    data_type = "string"
    
    if config.caseInsensitive and data_type == "string":
        val = val.lower()
    
    if config.normalizeNumbers:
        # Try to parse as number
        try:
            # Remove currency symbols and commas
            cleaned = re.sub(r'[^\d.\-]', '', val)
            if cleaned and cleaned != '-':
                num = Decimal(cleaned)
                return str(num)
        except Exception:
            pass
    
    return val


def compare_values(
    source_val: Any,
    dest_val: Any,
    mapping: ColumnMapping,
    config: ValidationConfig,
) -> tuple[bool, Optional[float]]:
    """Compare two values and return (match, difference)."""
    if source_val == "" and dest_val == "":
        return True, None
    
    if source_val == "" or dest_val == "":
        return False, None
    
    if mapping.dataType == "number":
        try:
            s = Decimal(str(source_val))
            d = Decimal(str(dest_val))
            diff = abs(s - d)
            tolerance = Decimal(str(config.numericTolerance))
            return diff <= tolerance, float(diff)
        except Exception:
            return source_val == dest_val, None
    
    if mapping.dataType == "date":
        return source_val == dest_val, None
    
    if mapping.dataType == "email":
        return source_val.lower() == dest_val.lower(), None
    
    # String comparison
    if config.caseInsensitive:
        return str(source_val).lower() == str(dest_val).lower(), None
    
    return str(source_val) == str(dest_val), None


def validate_email(email: str) -> bool:
    """Basic email validation."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def run_reconciliation_engine(
    source_df: pd.DataFrame,
    dest_df: pd.DataFrame,
    config: ReconciliationConfig,
) -> ReconciliationResults:
    """Core reconciliation engine."""
    start_time = time.time()
    
    mappings = config.columnMappings
    unique_id_col = config.uniqueIdentifier
    val_config = config.validation
    
    # Build lookup maps
    id_index = next((i for i, m in enumerate(mappings) if m.isUniqueIdentifier and m.sourceColumn), None)
    
    if id_index is None:
        # Find mapping where source column matches uniqueIdentifier
        id_mapping = next((m for m in mappings if m.sourceColumn == unique_id_col), None)
        if id_mapping:
            id_index = mappings.index(id_mapping)
    
    if id_index is None:
        raise ValueError("No unique identifier mapping found")
    
    id_mapping = mappings[id_index]
    source_id_col = id_mapping.sourceColumn
    dest_id_col = id_mapping.sourceColumn  # Will use destination mapping
    
    # Find destination mapping for the ID
    dest_id_mapping = next((m for m in mappings if m.isUniqueIdentifier and m.destinationColumn), None)
    if dest_id_mapping:
        dest_id_col = dest_id_mapping.destinationColumn
    else:
        # Find mapping where destination column corresponds to unique identifier
        for m in mappings:
            if m.sourceColumn == unique_id_col and m.destinationColumn:
                dest_id_col = m.destinationColumn
                break
    
    # Detect duplicates
    source_ids = source_df[source_id_col].astype(str).tolist() if source_id_col in source_df.columns else []
    dest_ids = dest_df[dest_id_col].astype(str).tolist() if dest_id_col in dest_df.columns else []
    
    from collections import Counter
    source_dup_ids = {k for k, v in Counter(source_ids).items() if v > 1 and k}
    dest_dup_ids = {k for k, v in Counter(dest_ids).items() if v > 1 and k}
    
    # Build destination lookup
    dest_lookup: Dict[str, List[int]] = {}
    if dest_id_col in dest_df.columns:
        for idx, row in dest_df.iterrows():
            rid = clean_identifier(row[dest_id_col], val_config.trimWhitespace)
            if rid:
                dest_lookup.setdefault(rid, []).append(idx)
    
    # Process source records
    records: List[ReconciliationRecord] = []
    all_issues: List[ValidationIssue] = []
    issue_counter = 0
    
    matched_count = 0
    mismatched_count = 0
    missing_count = 0
    unexpected_count = 0
    duplicate_count = 0
    invalid_count = 0
    
    source_id_col_clean = source_id_col
    
    for src_idx, src_row in source_df.iterrows():
        record_id = clean_identifier(src_row[source_id_col_clean], val_config.trimWhitespace)
        issues: List[ValidationIssue] = []
        field_comparisons: List[FieldComparison] = []
        
        # Check for missing identifier
        if not record_id:
            issue_counter += 1
            issues.append(ValidationIssue(
                id=f"issue-{issue_counter}",
                recordId=record_id or "UNKNOWN",
                field=source_id_col_clean,
                type="INVALID_IDENTIFIER",
                severity="error",
                message="Missing or empty unique identifier",
                sourceValue=src_row[source_id_col_clean],
            ))
            invalid_count += 1
        
        # Check for duplicate in source
        if record_id and record_id in source_dup_ids and val_config.detectDuplicates:
            issue_counter += 1
            issues.append(ValidationIssue(
                id=f"issue-{issue_counter}",
                recordId=record_id,
                field=source_id_col_clean,
                type="DUPLICATE",
                severity="warning",
                message=f"Duplicate identifier '{record_id}' in source dataset",
                sourceValue=record_id,
            ))
            duplicate_count += 1
        
        # Check required fields
        for field in val_config.requiredFields:
            if field in src_row.index:
                val = src_row[field]
                if pd.isna(val) or str(val).strip() == "":
                    issue_counter += 1
                    issues.append(ValidationIssue(
                        id=f"issue-{issue_counter}",
                        recordId=record_id,
                        field=field,
                        type="MISSING_REQUIRED",
                        severity="error",
                        message=f"Required field '{field}' is empty",
                        sourceValue=val,
                    ))
        
        # Validate emails
        if val_config.validateEmails:
            for mapping in mappings:
                if mapping.dataType == "email" and mapping.sourceColumn in src_row.index:
                    email_val = str(src_row[mapping.sourceColumn])
                    if email_val and not validate_email(email_val):
                        issue_counter += 1
                        issues.append(ValidationIssue(
                            id=f"issue-{issue_counter}",
                            recordId=record_id,
                            field=mapping.sourceColumn,
                            type="INVALID_EMAIL",
                            severity="error",
                            message=f"Invalid email format: {email_val}",
                            sourceValue=email_val,
                        ))
        
        # Validate numerics
        for mapping in mappings:
            if mapping.dataType == "number" and mapping.sourceColumn in src_row.index:
                num_val = str(src_row[mapping.sourceColumn])
                if num_val and num_val.strip():
                    try:
                        Decimal(re.sub(r'[^\d.\-]', '', num_val))
                    except Exception:
                        issue_counter += 1
                        issues.append(ValidationIssue(
                            id=f"issue-{issue_counter}",
                            recordId=record_id,
                            field=mapping.sourceColumn,
                            type="INVALID_NUMERIC",
                            severity="error",
                            message=f"Invalid numeric value: {num_val}",
                            sourceValue=num_val,
                        ))
        
        # Find matching destination record
        matched_dest_idx = None
        if record_id and record_id in dest_lookup:
            dest_indices = dest_lookup[record_id]
            if dest_indices:
                matched_dest_idx = dest_indices[0]  # Take first match
        
        if matched_dest_idx is not None:
            dest_row = dest_df.iloc[matched_dest_idx]
            
            # Check for duplicate in destination
            if record_id in dest_dup_ids and val_config.detectDuplicates:
                issue_counter += 1
                issues.append(ValidationIssue(
                    id=f"issue-{issue_counter}",
                    recordId=record_id,
                    field=dest_id_col,
                    type="DUPLICATE",
                    severity="warning",
                    message=f"Duplicate identifier '{record_id}' in destination dataset",
                    destinationValue=record_id,
                ))
                duplicate_count += 1
            
            # Compare mapped fields
            has_mismatch = False
            for mapping in mappings:
                if not mapping.destinationColumn:
                    continue
                
                src_val = src_row.get(mapping.sourceColumn, "") if mapping.sourceColumn in src_row.index else ""
                dest_val = dest_row.get(mapping.destinationColumn, "") if mapping.destinationColumn in dest_row.index else ""
                
                # Normalize
                norm_src = normalize_value(src_val, val_config, mapping.sourceColumn)
                norm_dest = normalize_value(dest_val, val_config, mapping.destinationColumn)
                
                match, diff = compare_values(norm_src, norm_dest, mapping, val_config)
                
                field_comparisons.append(FieldComparison(
                    field=f"{mapping.sourceColumn} → {mapping.destinationColumn}",
                    sourceValue=src_val,
                    destinationValue=dest_val,
                    normalizedSource=norm_src,
                    normalizedDestination=norm_dest,
                    match=match,
                    difference=diff,
                ))
                
                if not match:
                    has_mismatch = True
                    issue_counter += 1
                    issues.append(ValidationIssue(
                        id=f"issue-{issue_counter}",
                        recordId=record_id,
                        field=mapping.destinationColumn,
                        type="MISMATCH",
                        severity="error",
                        message=f"Value mismatch: source='{src_val}', destination='{dest_val}'",
                        sourceValue=src_val,
                        destinationValue=dest_val,
                    ))
            
            if issues:
                # Has issues beyond field comparison
                primary_status = "MISMATCHED" if has_mismatch else "INVALID"
                mismatched_count += 1 if has_mismatch else 0
                invalid_count += 1 if not has_mismatch and issues else 0
            else:
                primary_status = "MATCHED"
                matched_count += 1
        else:
            # Missing in destination
            if val_config.detectMissing and record_id:
                issue_counter += 1
                issues.append(ValidationIssue(
                    id=f"issue-{issue_counter}",
                    recordId=record_id,
                    field=dest_id_col,
                    type="MISSING_IN_DESTINATION",
                    severity="error",
                    message=f"Record '{record_id}' found in source but missing from destination",
                    sourceValue=record_id,
                ))
                missing_count += 1
            
            primary_status = "MISSING_IN_DESTINATION"
            
            # Still do field comparisons for source-only fields
            for mapping in mappings:
                src_val = src_row.get(mapping.sourceColumn, "") if mapping.sourceColumn in src_row.index else ""
                norm_src = normalize_value(src_val, val_config, mapping.sourceColumn)
                field_comparisons.append(FieldComparison(
                    field=mapping.sourceColumn,
                    sourceValue=src_val,
                    destinationValue=None,
                    normalizedSource=norm_src,
                    normalizedDestination=None,
                    match=False,
                ))
        
        if not issues and primary_status == "MATCHED":
            primary_status = "MATCHED"
        
        records.append(ReconciliationRecord(
            id=str(src_idx),
            recordId=record_id or f"ROW_{src_idx}",
            primaryStatus=primary_status,
            issueCount=len(issues),
            sourceData=src_row.to_dict(),
            destinationData=dest_row.to_dict() if matched_dest_idx is not None else {},
            normalizedSource={},
            normalizedDestination={},
            fieldComparisons=field_comparisons,
            issues=issues,
        ))
        
        all_issues.extend(issues)
    
    # Detect unexpected records (in destination but not in source)
    if val_config.detectUnexpected:
        matched_dest_indices = set()
        for rec in records:
            pass  # We need to track which dest rows were matched
        
        # Re-track matched dest indices
        matched_dest_set = set()
        for src_idx, src_row in source_df.iterrows():
            record_id = clean_identifier(src_row[source_id_col_clean], val_config.trimWhitespace)
            if record_id and record_id in dest_lookup:
                dest_indices = dest_lookup[record_id]
                if dest_indices:
                    matched_dest_set.add(dest_indices[0])
        
        for dest_idx, dest_row in dest_df.iterrows():
            if dest_idx in matched_dest_set:
                continue
            
            record_id = clean_identifier(dest_row[dest_id_col], val_config.trimWhitespace) if dest_id_col in dest_df.columns else f"ROW_{dest_idx}"
            
            issues: List[ValidationIssue] = []
            if val_config.detectUnexpected and record_id:
                issue_counter += 1
                issues.append(ValidationIssue(
                    id=f"issue-{issue_counter}",
                    recordId=record_id,
                    field=dest_id_col,
                    type="UNEXPECTED_IN_DESTINATION",
                    severity="error",
                    message=f"Record '{record_id}' found in destination but not in source",
                    destinationValue=record_id,
                ))
                unexpected_count += 1
            
            field_comparisons: List[FieldComparison] = []
            for mapping in mappings:
                if mapping.destinationColumn and mapping.destinationColumn in dest_row.index:
                    dest_val = dest_row[mapping.destinationColumn]
                    norm_dest = normalize_value(dest_val, val_config, mapping.destinationColumn)
                    field_comparisons.append(FieldComparison(
                        field=mapping.destinationColumn,
                        sourceValue=None,
                        destinationValue=dest_val,
                        normalizedSource=None,
                        normalizedDestination=norm_dest,
                        match=False,
                    ))
            
            records.append(ReconciliationRecord(
                id=f"dest_{dest_idx}",
                recordId=record_id,
                primaryStatus="UNEXPECTED_IN_DESTINATION",
                issueCount=len(issues),
                sourceData={},
                destinationData=dest_row.to_dict(),
                normalizedSource={},
                normalizedDestination={},
                fieldComparisons=field_comparisons,
                issues=issues,
            ))
            all_issues.extend(issues)
    
    total_issues = len(all_issues)
    total_source = len(source_df)
    match_pct = (matched_count / total_source * 100) if total_source > 0 else 0.0
    
    # Determine overall status
    if invalid_count > 0 or mismatched_count > 0 or missing_count > 0 or unexpected_count > 0:
        overall_status = "FAILED"
    elif duplicate_count > 0:
        overall_status = "PASSED_WITH_WARNINGS"
    else:
        overall_status = "PASSED"
    
    duration = (time.time() - start_time) * 1000
    
    return ReconciliationResults(
        metrics=ReconciliationMetrics(
            sourceRows=total_source,
            destinationRows=len(dest_df),
            matched=matched_count,
            mismatched=mismatched_count,
            missing=missing_count,
            unexpected=unexpected_count,
            duplicate=duplicate_count,
            invalid=invalid_count,
            totalIssues=total_issues,
            matchPercentage=round(match_pct, 2),
        ),
        records=records,
        issues=all_issues,
        duration=round(duration, 2),
        status=overall_status,
    )


# API Routes
@app.get("/api/health", response_model=HealthResponse)
async def health():
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        timestamp=datetime.utcnow().isoformat(),
    )


@app.get("/api/version")
async def version():
    return {"version": "1.0.0", "name": "FinSync"}


@app.post("/api/csv/preview", response_model=CSVPreviewResponse)
async def preview_csv(file: UploadFile = File(...)):
    """Preview a CSV file - returns headers and first 10 rows."""
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    content = await file.read()
    
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 20MB.")
    
    try:
        df = read_csv_safe(content, file.filename)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")
    
    if df.empty:
        raise HTTPException(status_code=400, detail="CSV file is empty")
    
    headers = df.columns.tolist()
    preview = df.head(10).to_dict("records")
    
    # Detect encoding
    encoding = "utf-8"
    try:
        content.decode("utf-8")
    except UnicodeDecodeError:
        encoding = "latin-1"
    
    return CSVPreviewResponse(
        headers=headers,
        preview=preview,
        rowCount=len(df),
        encoding=encoding,
        errors=[],
    )


@app.post("/api/csv/validate")
async def validate_csv(file: UploadFile = File(...)):
    """Validate a CSV file structure."""
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    content = await file.read()
    
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 20MB.")
    
    errors: List[str] = []
    
    try:
        df = read_csv_safe(content, file.filename)
    except Exception as e:
        return {"valid": False, "errors": [f"Failed to parse CSV: {str(e)}"]}
    
    if df.empty:
        errors.append("CSV file contains no data rows")
    
    if len(df.columns) == 0:
        errors.append("CSV file contains no columns")
    
    # Check for completely empty columns
    for col in df.columns:
        if df[col].astype(str).str.strip().eq("").all():
            errors.append(f"Column '{col}' is empty")
    
    return {"valid": len(errors) == 0, "errors": errors}


@app.post("/api/mapping/preview")
async def mapping_preview(
    sourceFile: UploadFile = File(...),
    destinationFile: UploadFile = File(...),
):
    """Get column names from both files for mapping suggestions."""
    source_content = await sourceFile.read()
    dest_content = await destinationFile.read()
    
    try:
        source_df = read_csv_safe(source_content, sourceFile.filename or "source.csv")
        dest_df = read_csv_safe(dest_content, destinationFile.filename or "destination.csv")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")
    
    return {
        "sourceColumns": source_df.columns.tolist(),
        "destinationColumns": dest_df.columns.tolist(),
        "sourceRowCount": len(source_df),
        "destinationRowCount": len(dest_df),
    }


@app.post("/api/reconciliation/validate-config")
async def validate_config(config: ReconciliationConfig):
    """Validate reconciliation configuration."""
    errors: List[str] = []
    
    if not config.uniqueIdentifier:
        errors.append("Unique identifier is required")
    
    if not config.columnMappings:
        errors.append("At least one column mapping is required")
    
    # Check for duplicate destination mappings
    dest_cols = [m.destinationColumn for m in config.columnMappings if m.destinationColumn]
    if len(dest_cols) != len(set(dest_cols)):
        errors.append("Duplicate destination column mappings detected")
    
    # Check unique identifier is mapped
    id_mapped = any(m.isUniqueIdentifier for m in config.columnMappings)
    if not id_mapped:
        errors.append("No column marked as unique identifier")
    
    return {"valid": len(errors) == 0, "errors": errors}


@app.post("/api/reconciliation/run")
async def run_reconciliation(
    sourceFile: UploadFile = File(...),
    destinationFile: UploadFile = File(...),
    config: str = Form(..., description="JSON string of ReconciliationConfig"),
):
    """Run reconciliation on two CSV files."""
    import json
    
    try:
        config_data = json.loads(config)
        reconciliation_config = ReconciliationConfig(**config_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid configuration: {str(e)}")
    
    # Validate config
    if not reconciliation_config.uniqueIdentifier:
        raise HTTPException(status_code=400, detail="Unique identifier is required")
    
    # Read files
    source_content = await sourceFile.read()
    dest_content = await destinationFile.read()
    
    if len(source_content) > MAX_FILE_SIZE or len(dest_content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 20MB.")
    
    try:
        source_df = read_csv_safe(source_content, sourceFile.filename or "source.csv")
        dest_df = read_csv_safe(dest_content, destinationFile.filename or "destination.csv")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")
    
    if source_df.empty:
        raise HTTPException(status_code=400, detail="Source CSV is empty")
    if dest_df.empty:
        raise HTTPException(status_code=400, detail="Destination CSV is empty")
    
    # Run reconciliation
    try:
        results = run_reconciliation_engine(source_df, dest_df, reconciliation_config)
    except Exception as e:
        logger.error(f"Reconciliation error: {e}")
        raise HTTPException(status_code=500, detail=f"Reconciliation failed: {str(e)}")
    
    session_id = str(uuid.uuid4())
    
    return {
        "sessionId": session_id,
        "results": results.dict(),
    }


@app.post("/api/reports/{report_type}")
async def generate_report(report_type: str, session_id: str = Query(...)):
    """Generate a reconciliation report."""
    valid_types = {"complete", "mismatches", "missing", "unexpected", "duplicates", "invalid", "summary"}
    if report_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Invalid report type. Must be one of: {', '.join(valid_types)}")
    
    # Since we don't persist sessions, generate a sample report
    # In production, this would fetch from a database
    
    # Create a CSV report
    output = io.StringIO()
    writer = None
    
    if report_type == "summary":
        output.write("Metric,Value\n")
        output.write("Source Rows,0\n")
        output.write("Destination Rows,0\n")
        output.write("Matched,0\n")
        output.write("Mismatched,0\n")
        output.write("Missing,0\n")
        output.write("Unexpected,0\n")
        output.write("Duplicate,0\n")
        output.write("Invalid,0\n")
    elif report_type == "mismatches":
        output.write("Record ID,Field,Source Value,Destination Value,Difference,Reason\n")
    elif report_type == "missing":
        output.write("Record ID,Field,Source Value,Reason\n")
    elif report_type == "unexpected":
        output.write("Record ID,Field,Destination Value,Reason\n")
    elif report_type == "duplicates":
        output.write("Record ID,Field,Value,Reason\n")
    elif report_type == "invalid":
        output.write("Record ID,Field,Value,Reason\n")
    else:  # complete
        output.write("Record ID,Status,Source Values,Destination Values,Issues\n")
    
    output.seek(0)
    
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{report_type}-report.csv"'},
    )


# Cleanup temp files on shutdown
@app.on_event("shutdown")
async def cleanup():
    for path in temp_files.values():
        try:
            if os.path.exists(path):
                os.remove(path)
        except Exception:
            pass
    temp_files.clear()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)