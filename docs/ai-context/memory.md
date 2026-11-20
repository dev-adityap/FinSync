# FinSync Project Context & Key Decisions

## Key Decisions
- Local-first browser persistence (IndexedDB) with stateless zero-retention backend processing.
- Decimal precision for numeric comparisons where configured.
- Leading-zero ID preservation (string IDs).
- Status rollups: PASSED / PASSED_WITH_WARNINGS / FAILED.

## Known Gotchas
- Avoid duplicate files outside `frontend/src/`.
- Keep `.venv` selected in VS Code (`backend/.vscode/settings.json`).
- Ensure `<select>/<option>` styling remains readable across light/dark themes.
- Backend temporary files must be cleaned up after each request.
