import csv
from pathlib import Path
from typing import Any, Dict, List, Tuple

from app.core.exceptions import InvalidFileError

ENCODINGS_TO_TRY = ("utf-8-sig", "utf-8", "cp1252", "latin-1")


def _read_csv_raw_rows(file_path: Path) -> Tuple[List[str], List[Dict[str, str]], str]:
    last_err: Exception | None = None
    for enc in ENCODINGS_TO_TRY:
        try:
            with file_path.open("r", encoding=enc, newline="") as handle:
                sample = handle.read(4096)
                handle.seek(0)
                if not sample.strip():
                    raise InvalidFileError("CSV file contains no readable data.")

                try:
                    dialect = csv.Sniffer().sniff(sample, delimiters=",;\t|")
                except csv.Error:
                    dialect = csv.excel

                reader = csv.reader(handle, dialect=dialect)
                try:
                    raw_headers = next(reader)
                except StopIteration as exc:
                    raise InvalidFileError("CSV file is missing a header row.") from exc

                headers = [h.strip() for h in raw_headers]
                if not headers or all(h == "" for h in headers):
                    raise InvalidFileError("CSV header row has no valid column names.")

                rows: List[Dict[str, str]] = []
                for row_idx, raw_row in enumerate(reader, start=2):
                    if len(raw_row) > len(headers):
                        raise InvalidFileError(
                            f"Malformed CSV at line {row_idx}: found {len(raw_row)} values for {len(headers)} headers."
                        )
                    if all(cell.strip() == "" for cell in raw_row):
                        continue
                    record: Dict[str, str] = {}
                    for col_idx, col_name in enumerate(headers):
                        cell_val = raw_row[col_idx] if col_idx < len(raw_row) else ""
                        # Preserve exact strings (including leading zeros)
                        record[col_name] = cell_val
                    rows.append(record)

                if len(rows) == 0:
                    raise InvalidFileError("CSV file has headers but zero data rows.")

                return headers, rows, enc
        except InvalidFileError:
            raise
        except UnicodeDecodeError as exc:
            last_err = exc
            continue
        except csv.Error as exc:
            raise InvalidFileError(f"Malformed CSV content: {exc}") from exc

    raise InvalidFileError(f"Unable to decode CSV file using supported encodings: {last_err}")


def _infer_column_type(values: List[str]) -> str:
    non_empty = [v.strip() for v in values if v and v.strip()]
    if not non_empty:
        return "string"

    email_like = sum(1 for v in non_empty if "@" in v and "." in v.split("@")[-1])
    if email_like == len(non_empty):
        return "email"

    currency_like = sum(
        1 for v in non_empty if any(sym in v for sym in ("$", "€", "£", "₹", "¥"))
    )
    if currency_like > 0:
        return "currency"

    numeric_count = 0
    for v in non_empty:
        cleaned = v.replace(",", "").strip()
        try:
            float(cleaned)
            numeric_count += 1
        except ValueError:
            pass
    if numeric_count == len(non_empty):
        return "number"

    return "string"


def build_csv_preview(file_path: Path, file_size_bytes: int, preview_limit: int = 10) -> Dict[str, Any]:
    headers, rows, encoding_used = _read_csv_raw_rows(file_path)
    clamped_limit = max(1, min(preview_limit, 100))
    sample_rows = rows[:clamped_limit]

    column_stats: List[Dict[str, Any]] = []
    for col in headers:
        col_vals = [r.get(col, "") for r in rows]
        missing_count = sum(1 for v in col_vals if v is None or str(v).strip() == "")
        distinct_vals = {str(v) for v in col_vals if v is not None and str(v) != ""}
        samples = []
        for v in col_vals:
            if v is not None and str(v) != "" and str(v) not in samples:
                samples.append(str(v))
            if len(samples) >= 5:
                break

        column_stats.append(
            {
                "column": col,
                "missing_count": missing_count,
                "unique_count": len(distinct_vals),
                "inferred_type": _infer_column_type(col_vals),
                "sample_values": samples,
            }
        )

    return {
        "file_name": file_path.name,
        "file_size_bytes": file_size_bytes,
        "row_count": len(rows),
        "headers": headers,
        "sample_rows": sample_rows,
        "column_stats": column_stats,
        "encoding_used": encoding_used,
    }


def validate_csv_structure(file_path: Path, file_size_bytes: int) -> Dict[str, Any]:
    headers, rows, _ = _read_csv_raw_rows(file_path)
    warnings: List[str] = []
    errors: List[str] = []

    if len(headers) != len(set(headers)):
        warnings.append("Duplicate column header names detected; ensure unique column selection.")

    for col in headers:
        empty_rows = sum(1 for r in rows if str(r.get(col, "")).strip() == "")
        if empty_rows > 0:
            warnings.append(f"Column '{col}' has {empty_rows} empty/blank value(s).")

    return {
        "valid": len(errors) == 0,
        "file_name": file_path.name,
        "file_size_bytes": file_size_bytes,
        "row_count": len(rows),
        "headers": headers,
        "warnings": warnings,
        "errors": errors,
    }