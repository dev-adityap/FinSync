import io
from typing import Any, Optional

from app.core.security import sanitize_csv_cell


def generate_filtered_report_csv(records: list[dict[str, Any]], allowed_statuses: Optional[set[str]] = None) -> str:
    filtered = records
    if allowed_statuses is not None:
        filtered = [
            r for r in records
            if (r.get("primary_status") or r.get("primaryStatus")) in allowed_statuses
        ]

    buffer = io.StringIO()
    header = [
        "record_id",
        "primary_status",
        "issue_count",
        "issue_types",
        "source_summary",
        "destination_summary",
        "validation_reasons",
    ]
    buffer.write(",".join(sanitize_csv_cell(h) for h in header) + "\n")
    for record in filtered:
        row = [
            record.get("record_id", record.get("recordId", "")),
            record.get("primary_status", record.get("primaryStatus", "")),
            record.get("issue_count", record.get("issueCount", 0)),
            ";".join(record.get("issue_types", record.get("issueTypes", [])) or []),
            record.get("source_summary", record.get("sourceSummary", "")),
            record.get("destination_summary", record.get("destinationSummary", "")),
            " | ".join(record.get("validation_reasons", record.get("validationReasons", [])) or []),
        ]
        buffer.write(",".join(sanitize_csv_cell(v) for v in row) + "\n")
    return buffer.getvalue()
