import re
from pathlib import Path

_FORMULA_PREFIX_RE = re.compile(r"^[=+\-@\t\r]")


def sanitize_filename(filename: str | None, fallback: str = "upload.csv") -> str:
    if not filename:
        return fallback
    base = Path(filename).name
    cleaned = re.sub(r"[^A-Za-z0-9._-]", "_", base).strip("._")
    if not cleaned:
        return fallback
    if not cleaned.lower().endswith(".csv"):
        cleaned = f"{cleaned}.csv"
    return cleaned[:120]


def ensure_within_directory(target: Path, root: Path) -> Path:
    resolved_root = root.resolve()
    resolved_target = target.resolve()
    try:
        resolved_target.relative_to(resolved_root)
    except ValueError as exc:
        raise ValueError("Invalid file path outside allowed temporary workspace.") from exc
    return resolved_target


def sanitize_csv_cell(value: object) -> str:
    if value is None:
        text = ""
    else:
        text = str(value)
    if _FORMULA_PREFIX_RE.match(text):
        text = f"'{text}"
    escaped = text.replace('"', '""')
    return f'"{escaped}"'