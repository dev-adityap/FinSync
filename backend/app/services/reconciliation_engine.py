import re
import time
from collections import defaultdict
from datetime import datetime
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import pandas as pd

from app.core.exceptions import ConfigurationValidationError
from app.services.csv_parser import _read_csv_raw_rows

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
_CURRENCY_STRIP_RE = re.compile(r"[$€£¥₹,\s]")

# Deterministic status precedence:
# INVALID > DUPLICATE > MISSING_IN_DESTINATION > UNEXPECTED_IN_DESTINATION > MISMATCHED > MATCHED
STATUS_PRECEDENCE: List[str] = [
    "INVALID",
    "DUPLICATE",
    "MISSING_IN_DESTINATION",
    "UNEXPECTED_IN_DESTINATION",
    "MISMATCHED",
    "MATCHED",
]


def _highest_precedence_status(statuses: List[str]) -> str:
    for candidate in STATUS_PRECEDENCE:
        if candidate in statuses:
            return candidate
    return "MATCHED"


def _apply_string_rules(raw: Optional[str], trim_ws: bool, case_insensitive: bool) -> Optional[str]:
    if raw is None:
        return None
    val = str(raw)
    if trim_ws:
        val = val.strip()
    if case_insensitive:
        val = val.lower()
    return val


def _parse_decimal_safe(raw: Optional[str], trim_ws: bool) -> Tuple[Optional[Decimal], bool]:
    if raw is None:
        return None, False
    text = str(raw)
    if trim_ws:
        text = text.strip()
    if text == "":
        return None, False
    cleaned = _CURRENCY_STRIP_RE.sub("", text)
    # Handle accounting parentheses like (500.00) -> -500.00
    if cleaned.startswith("(") and cleaned.endswith(")") and len(cleaned) > 2:
        cleaned = f"-{cleaned[1:-1]}"
    try:
        dec = Decimal(cleaned)
        if not dec.is_finite():
            return None, False
        return dec, True
    except InvalidOperation:
        return None, False


def _parse_date_safe(raw: Optional[str], date_format: str, trim_ws: bool) -> Tuple[Optional[str], bool]:
    if raw is None:
        return None, False
    text = str(raw)
    if trim_ws:
        text = text.strip()
    if text == "":
        return None, False
    fmt = date_format.strip() or "%Y-%m-%d"
    try:
        parsed = datetime.strptime(text, fmt)
        return parsed.strftime("%Y-%m-%d"), True
    except ValueError:
        return None, False


def _format_summary(row: Dict[str, str], keys: List[str], limit: int = 3) -> str:
    parts: List[str] = []
    for k in keys[:limit]:
        if k in row:
            parts.append(f"{k}={row[k]}")
    if not parts:
        for k, v in list(row.items())[:limit]:
            parts.append(f"{k}={v}")
    return ", ".join(parts)


def validate_reconciliation_config_dict(config: Dict[str, Any]) -> Tuple[List[str], List[str]]:
    errors: List[str] = []
    warnings: List[str] = []

    key_src = (config.get("unique_key_source") or "").strip()
    key_dst = (config.get("unique_key_destination") or "").strip()
    if not key_src:
        errors.append("Source unique identifier column is required.")
    if not key_dst:
        errors.append("Destination unique identifier column is required.")

    mappings = config.get("field_mappings") or []
    active = [
        m for m in mappings
        if (m.get("source_column") or "").strip() and (m.get("destination_column") or "").strip()
    ]
    if not active:
        errors.append("At least one active source-to-destination column mapping is required.")

    seen_dest: Dict[str, str] = {}
    for m in active:
        src_c = m["source_column"].strip()
        dst_c = m["destination_column"].strip()
        if dst_c in seen_dest:
            errors.append(
                f"Duplicate destination mapping: '{dst_c}' mapped from both '{seen_dest[dst_c]}' and '{src_c}'."
            )
        else:
            seen_dest[dst_c] = src_c

    if key_src and key_dst:
        pair_exists = any(
            m["source_column"].strip() == key_src and m["destination_column"].strip() == key_dst
            for m in active
        )
        if not pair_exists:
            errors.append(
                f"Unique key pair ('{key_src}' -> '{key_dst}') must be present in active field mappings."
            )

    opts = config.get("validation_options") or {}
    tol_raw = str(opts.get("numeric_tolerance", "0.01")).strip()
    try:
        tol_dec = Decimal(tol_raw)
        if not tol_dec.is_finite() or tol_dec < Decimal("0"):
            errors.append("Numeric tolerance must be a non-negative number.")
    except InvalidOperation:
        errors.append(f"Invalid numeric tolerance value: '{tol_raw}'.")

    if bool(opts.get("normalize_dates", False)) and not str(opts.get("date_format", "")).strip():
        errors.append("Date format must be specified when date normalization is enabled.")

    if not bool(opts.get("detect_duplicates", True)):
        warnings.append("Duplicate detection is disabled; duplicate IDs may produce unexpected matches.")

    return errors, warnings


def run_reconciliation_engine(
    session_id: str,
    source_path: Path,
    destination_path: Path,
    config: Dict[str, Any],
) -> Dict[str, Any]:
    start_time = time.perf_counter()

    cfg_errors, _ = validate_reconciliation_config_dict(config)
    if cfg_errors:
        raise ConfigurationValidationError("; ".join(cfg_errors))

    src_headers, src_rows, _ = _read_csv_raw_rows(source_path)
    dst_headers, dst_rows, _ = _read_csv_raw_rows(destination_path)

    # Load into DataFrames preserving strings/leading zeros to verify schema & row parity
    _ = pd.DataFrame(src_rows, columns=src_headers, dtype=str)
    _ = pd.DataFrame(dst_rows, columns=dst_headers, dtype=str)

    key_src = config["unique_key_source"].strip()
    key_dst = config["unique_key_destination"].strip()
    if key_src not in src_headers:
        raise ConfigurationValidationError(f"Source key column '{key_src}' not found in source CSV.")
    if key_dst not in dst_headers:
        raise ConfigurationValidationError(
            f"Destination key column '{key_dst}' not found in destination CSV."
        )

    active_mappings = [
        {
            "source_column": m["source_column"].strip(),
            "destination_column": m["destination_column"].strip(),
            "data_type": (m.get("data_type") or "string").strip().lower(),
            "required": bool(m.get("required", False)),
        }
        for m in (config.get("field_mappings") or [])
        if (m.get("source_column") or "").strip() and (m.get("destination_column") or "").strip()
    ]

    opts = config.get("validation_options") or {}
    trim_ws = bool(opts.get("trim_whitespace", True))
    case_insensitive = bool(opts.get("case_insensitive", False))
    normalize_numbers = bool(opts.get("normalize_numbers", True))
    normalize_dates = bool(opts.get("normalize_dates", False))
    date_format = str(opts.get("date_format", "%Y-%m-%d")).strip() or "%Y-%m-%d"
    tolerance_dec = Decimal(str(opts.get("numeric_tolerance", "0.01")).strip() or "0.01")

    detect_missing = bool(opts.get("detect_missing", True))
    detect_unexpected = bool(opts.get("detect_unexpected", True))
    detect_duplicates = bool(opts.get("detect_duplicates", True))
    validate_required = bool(opts.get("validate_required", True))
    validate_non_empty = bool(opts.get("validate_non_empty", True))
    validate_numeric = bool(opts.get("validate_numeric", True))
    validate_email = bool(opts.get("validate_email", True))

    def key_lookup(val: Optional[str]) -> str:
        raw = "" if val is None else str(val)
        return raw.strip() if trim_ws else raw

    # Index records by unique key (preserving leading zeros)
    src_by_key: Dict[str, List[Tuple[int, Dict[str, str]]]] = defaultdict(list)
    for idx, row in enumerate(src_rows):
        k = key_lookup(row.get(key_src, ""))
        src_by_key[k].append((idx, row))

    dst_by_key: Dict[str, List[Tuple[int, Dict[str, str]]]] = defaultdict(list)
    for idx, row in enumerate(dst_rows):
        k = key_lookup(row.get(key_dst, ""))
        dst_by_key[k].append((idx, row))

    all_keys: List[str] = []
    seen_all_keys = set()
    for k in list(src_by_key.keys()) + list(dst_by_key.keys()):
        if k not in seen_all_keys:
            seen_all_keys.add(k)
            all_keys.append(k)

    record_outputs: List[Dict[str, Any]] = []
    matched_source_records = 0
    mismatched_records = 0
    missing_records = 0
    unexpected_records = 0
    duplicate_records = 0
    invalid_records = 0
    total_issues = 0

    def validate_single_side_row(
        row: Dict[str, str], side: str
    ) -> Tuple[List[str], List[str], List[Dict[str, Any]]]:
        reasons: List[str] = []
        issue_types: List[str] = []
        field_issues_list: List[Dict[str, Any]] = []

        key_col = key_src if side == "source" else key_dst
        raw_key = row.get(key_col, "")
        if validate_required and (raw_key is None or str(raw_key).strip() == ""):
            reasons.append(f"Missing unique identifier in {side} column '{key_col}'.")
            issue_types.append("MISSING_IDENTIFIER")
            field_issues_list.append({"field": key_col, "reason": "Missing identifier"})

        for m in active_mappings:
            col_name = m["source_column"] if side == "source" else m["destination_column"]
            dtype = m["data_type"]
            is_req = m["required"]
            raw_val = row.get(col_name, "")
            is_empty = raw_val is None or str(raw_val).strip() == ""

            if validate_required and is_req and is_empty:
                reasons.append(f"Missing required {side} field '{col_name}'.")
                issue_types.append("MISSING_REQUIRED_FIELD")
                field_issues_list.append({"field": col_name, "reason": "Required value missing"})

            if validate_non_empty and is_empty:
                reasons.append(f"Empty value in {side} field '{col_name}'.")
                issue_types.append("EMPTY_VALUE")

            if not is_empty:
                if dtype in ("number", "currency") and validate_numeric:
                    _, ok_num = _parse_decimal_safe(raw_val, trim_ws)
                    if not ok_num:
                        reasons.append(f"Invalid numeric value '{raw_val}' in {side} field '{col_name}'.")
                        issue_types.append("INVALID_NUMERIC")
                elif dtype == "date" and normalize_dates:
                    _, ok_dt = _parse_date_safe(raw_val, date_format, trim_ws)
                    if not ok_dt:
                        reasons.append(
                            f"Invalid date '{raw_val}' in {side} field '{col_name}' (expected format {date_format})."
                        )
                        issue_types.append("INVALID_DATE")
                elif dtype == "email" and validate_email:
                    candidate_email = str(raw_val).strip() if trim_ws else str(raw_val)
                    if not _EMAIL_RE.match(candidate_email):
                        reasons.append(f"Invalid email format '{raw_val}' in {side} field '{col_name}'.")
                        issue_types.append("INVALID_EMAIL")

        return reasons, issue_types, field_issues_list

    for k in all_keys:
        src_entries = src_by_key.get(k, [])
        dst_entries = dst_by_key.get(k, [])

        src_is_dup = detect_duplicates and len(src_entries) > 1
        dst_is_dup = detect_duplicates and len(dst_entries) > 1
        has_dup = src_is_dup or dst_is_dup

        # Case A: Key only in source
        if len(src_entries) > 0 and len(dst_entries) == 0:
            for _, s_row in src_entries:
                reasons, itypes, _ = validate_single_side_row(s_row, "source")
                statuses: List[str] = []
                if reasons:
                    statuses.append("INVALID")
                if src_is_dup:
                    statuses.append("DUPLICATE")
                    reasons.append(f"Duplicate identifier '{k}' found {len(src_entries)} times in source.")
                    itypes.append("DUPLICATE_ID")
                if detect_missing:
                    statuses.append("MISSING_IN_DESTINATION")
                    reasons.append(f"Record '{k}' is missing in destination dataset.")
                    itypes.append("MISSING_IN_DESTINATION")

                primary = _highest_precedence_status(statuses)
                distinct_issues = list(dict.fromkeys(itypes))
                rec_issue_count = len(reasons) if len(reasons) > 0 else (1 if primary != "MATCHED" else 0)
                total_issues += rec_issue_count

                if primary == "INVALID":
                    invalid_records += 1
                elif primary == "DUPLICATE":
                    duplicate_records += 1
                elif primary == "MISSING_IN_DESTINATION":
                    missing_records += 1

                record_outputs.append(
                    {
                        "record_id": k,
                        "primary_status": primary,
                        "issue_count": rec_issue_count,
                        "issue_types": distinct_issues,
                        "source_summary": _format_summary(s_row, [key_src] + [m["source_column"] for m in active_mappings]),
                        "destination_summary": "",
                        "source_values": dict(s_row),
                        "destination_values": {},
                        "field_comparisons": [],
                        "validation_reasons": list(dict.fromkeys(reasons)),
                    }
                )
            continue

        # Case B: Key only in destination
        if len(dst_entries) > 0 and len(src_entries) == 0:
            for _, d_row in dst_entries:
                reasons, itypes, _ = validate_single_side_row(d_row, "destination")
                statuses = []
                if reasons:
                    statuses.append("INVALID")
                if dst_is_dup:
                    statuses.append("DUPLICATE")
                    reasons.append(f"Duplicate identifier '{k}' found {len(dst_entries)} times in destination.")
                    itypes.append("DUPLICATE_ID")
                if detect_unexpected:
                    statuses.append("UNEXPECTED_IN_DESTINATION")
                    reasons.append(f"Record '{k}' exists in destination but not in source.")
                    itypes.append("UNEXPECTED_IN_DESTINATION")

                primary = _highest_precedence_status(statuses)
                distinct_issues = list(dict.fromkeys(itypes))
                rec_issue_count = len(reasons) if len(reasons) > 0 else (1 if primary != "MATCHED" else 0)
                total_issues += rec_issue_count

                if primary == "INVALID":
                    invalid_records += 1
                elif primary == "DUPLICATE":
                    duplicate_records += 1
                elif primary == "UNEXPECTED_IN_DESTINATION":
                    unexpected_records += 1

                record_outputs.append(
                    {
                        "record_id": k,
                        "primary_status": primary,
                        "issue_count": rec_issue_count,
                        "issue_types": distinct_issues,
                        "source_summary": "",
                        "destination_summary": _format_summary(
                            d_row, [key_dst] + [m["destination_column"] for m in active_mappings]
                        ),
                        "source_values": {},
                        "destination_values": dict(d_row),
                        "field_comparisons": [],
                        "validation_reasons": list(dict.fromkeys(reasons)),
                    }
                )
            continue

        # Case C: Present in both source and destination
        # If either side has duplicates, do not arbitrarily match single rows cleanly
        if has_dup:
            for _, s_row in src_entries:
                reasons, itypes, _ = validate_single_side_row(s_row, "source")
                statuses = []
                if reasons:
                    statuses.append("INVALID")
                if src_is_dup:
                    statuses.append("DUPLICATE")
                    reasons.append(f"Duplicate key '{k}' appears {len(src_entries)} times in source.")
                    itypes.append("DUPLICATE_ID")
                if dst_is_dup:
                    statuses.append("DUPLICATE")
                    reasons.append(f"Duplicate key '{k}' appears {len(dst_entries)} times in destination.")
                    itypes.append("DUPLICATE_ID")

                primary = _highest_precedence_status(statuses)
                distinct_issues = list(dict.fromkeys(itypes))
                rec_issue_count = max(1, len(reasons))
                total_issues += rec_issue_count
                if primary == "INVALID":
                    invalid_records += 1
                else:
                    duplicate_records += 1

                first_dst = dst_entries[0][1]
                record_outputs.append(
                    {
                        "record_id": k,
                        "primary_status": primary,
                        "issue_count": rec_issue_count,
                        "issue_types": distinct_issues,
                        "source_summary": _format_summary(s_row, [key_src] + [m["source_column"] for m in active_mappings]),
                        "destination_summary": _format_summary(
                            first_dst, [key_dst] + [m["destination_column"] for m in active_mappings]
                        ),
                        "source_values": dict(s_row),
                        "destination_values": dict(first_dst),
                        "field_comparisons": [],
                        "validation_reasons": list(dict.fromkeys(reasons)),
                    }
                )
            continue

        # Standard 1-to-1 comparison
        s_row = src_entries[0][1]
        d_row = dst_entries[0][1]

        src_reasons, src_itypes, _ = validate_single_side_row(s_row, "source")
        dst_reasons, dst_itypes, _ = validate_single_side_row(d_row, "destination")

        reasons = list(dict.fromkeys(src_reasons + dst_reasons))
        itypes = list(dict.fromkeys(src_itypes + dst_itypes))
        field_comparisons: List[Dict[str, Any]] = []
        any_field_mismatch = False

        for m in active_mappings:
            src_col = m["source_column"]
            dst_col = m["destination_column"]
            dtype = m["data_type"]
            field_label = f"{src_col} -> {dst_col}" if src_col != dst_col else src_col

            s_raw = s_row.get(src_col, "")
            d_raw = d_row.get(dst_col, "")

            s_norm: Optional[str] = s_raw
            d_norm: Optional[str] = d_raw
            diff_str: Optional[str] = None
            field_ok = True
            f_issues: List[str] = []

            if dtype in ("number", "currency") and (normalize_numbers or validate_numeric):
                s_dec, s_ok = _parse_decimal_safe(s_raw, trim_ws)
                d_dec, d_ok = _parse_decimal_safe(d_raw, trim_ws)
                s_norm = str(s_dec) if s_ok and s_dec is not None else s_raw
                d_norm = str(d_dec) if d_ok and d_dec is not None else d_raw

                if s_ok and d_ok and s_dec is not None and d_dec is not None:
                    delta = abs(s_dec - d_dec)
                    signed_diff = s_dec - d_dec
                    if delta > tolerance_dec:
                        field_ok = False
                        any_field_mismatch = True
                        diff_str = str(signed_diff)
                        msg = (
                            f"Field '{field_label}' value mismatch: source='{s_raw}' vs destination='{d_raw}' "
                            f"(diff={signed_diff}, tolerance={tolerance_dec})."
                        )
                        f_issues.append(msg)
                        reasons.append(msg)
                        itypes.append("VALUE_MISMATCH")
                else:
                    if s_ok != d_ok:
                        field_ok = False
                        any_field_mismatch = True
                        msg = f"Field '{field_label}' type/value mismatch: source='{s_raw}' vs destination='{d_raw}'."
                        f_issues.append(msg)
                        reasons.append(msg)
                        itypes.append("VALUE_MISMATCH")
            elif dtype == "date" and normalize_dates:
                s_dt, s_ok = _parse_date_safe(s_raw, date_format, trim_ws)
                d_dt, d_ok = _parse_date_safe(d_raw, date_format, trim_ws)
                s_norm = s_dt if s_ok else s_raw
                d_norm = d_dt if d_ok else d_raw
                if s_ok and d_ok and s_dt != d_dt:
                    field_ok = False
                    any_field_mismatch = True
                    msg = f"Date mismatch in '{field_label}': source='{s_dt}' vs destination='{d_dt}'."
                    f_issues.append(msg)
                    reasons.append(msg)
                    itypes.append("VALUE_MISMATCH")
            else:
                s_norm = _apply_string_rules(s_raw, trim_ws, case_insensitive)
                d_norm = _apply_string_rules(d_raw, trim_ws, case_insensitive)
                if s_norm != d_norm:
                    field_ok = False
                    any_field_mismatch = True
                    msg = f"Mismatch in '{field_label}': source='{s_raw}' vs destination='{d_raw}'."
                    f_issues.append(msg)
                    reasons.append(msg)
                    itypes.append("VALUE_MISMATCH")

            field_comparisons.append(
                {
                    "field_label": field_label,
                    "source_column": src_col,
                    "destination_column": dst_col,
                    "source_raw": s_raw,
                    "destination_raw": d_raw,
                    "source_normalized": s_norm,
                    "destination_normalized": d_norm,
                    "difference": diff_str,
                    "matched": field_ok,
                    "issues": f_issues,
                }
            )

        statuses = []
        if src_reasons or dst_reasons:
            statuses.append("INVALID")
        if any_field_mismatch:
            statuses.append("MISMATCHED")
        if not statuses:
            statuses.append("MATCHED")

        primary = _highest_precedence_status(statuses)
        distinct_issues = list(dict.fromkeys(itypes))
        rec_issue_count = len(reasons)
        total_issues += rec_issue_count

        if primary == "INVALID":
            invalid_records += 1
        elif primary == "MISMATCHED":
            mismatched_records += 1
        elif primary == "MATCHED":
            matched_source_records += 1

        record_outputs.append(
            {
                "record_id": k,
                "primary_status": primary,
                "issue_count": rec_issue_count,
                "issue_types": distinct_issues,
                "source_summary": _format_summary(s_row, [key_src] + [m["source_column"] for m in active_mappings]),
                "destination_summary": _format_summary(
                    d_row, [key_dst] + [m["destination_column"] for m in active_mappings]
                ),
                "source_values": dict(s_row),
                "destination_values": dict(d_row),
                "field_comparisons": field_comparisons,
                "validation_reasons": list(dict.fromkeys(reasons)),
            }
        )

    total_source_rows = len(src_rows)
    total_dest_rows = len(dst_rows)
    match_percentage = (
        round((matched_source_records / total_source_rows) * 100.0, 2)
        if total_source_rows > 0
        else 0.0
    )

    if invalid_records > 0 or total_source_rows == 0:
        overall_status = "FAILED"
    elif (
        mismatched_records > 0
        or missing_records > 0
        or unexpected_records > 0
        or duplicate_records > 0
    ):
        overall_status = "PASSED_WITH_WARNINGS"
    else:
        overall_status = "PASSED"

    duration_ms = round((time.perf_counter() - start_time) * 1000.0, 2)

    return {
        "session_id": session_id,
        "overall_validation_status": overall_status,
        "match_percentage": match_percentage,
        "source_row_count": total_source_rows,
        "destination_row_count": total_dest_rows,
        "matched_count": matched_source_records,
        "mismatched_count": mismatched_records,
        "missing_count": missing_records,
        "unexpected_count": unexpected_records,
        "duplicate_count": duplicate_records,
        "invalid_count": invalid_records,
        "total_issues": total_issues,
        "duration_ms": duration_ms,
        "records": record_outputs,
    }