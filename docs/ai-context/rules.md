# FinSync Coding Rules & Guardrails

## TypeScript / Frontend
- Strict TypeScript: `npx tsc --noEmit` must return 0 errors.
- Keep source under `frontend/src/`; avoid duplicate files outside `src/`.
- Preserve component prop interfaces and filenames in `frontend/src/components/glass/*`.
- Do not alter reconciliation algorithms, Dexie schemas, or API payloads in `db/*`, `services/*`, `types/*`, or `WorkspaceContext.tsx`.
- Ensure UI text/select contrast accessible in both light and dark modes.

## Backend
- Keep validation/reconciliation deterministic.
- Maintain route/hook/schema compatibility.
- Temporary files must be cleaned up after processing.
- Python environment: use `backend/.venv`, install `requirements.txt`.

## Build/Test
- Frontend: `npm run build` must succeed.
- Backend: `pytest` in `backend/` must pass.
