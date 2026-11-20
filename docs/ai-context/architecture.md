# FinSync Architecture

## High-Level System Layout
- frontend/: React + TypeScript + Vite + Tailwind CSS + Dexie/IndexedDB (local-first browser workspace)
- backend/: FastAPI + Pandas + Pytest (stateless, zero-retention validation/CSV/report endpoints)

## Data Flow
- Browser stores projects, sessions, configs, results in IndexedDB (Dexie).
- Frontend calls backend endpoints for CSV preview/validation, reconciliation execution, mapping preview, report export.
- Backend processes uploaded CSVs via temporary files and cleans them up after each request.
- No persistent server-side storage; zero-retention processing.

## Backend Structure
- app/api/v1: csv_routes, health, mapping_routes, reconcile_routes, report_routes, router
- app/core: config, exceptions, security
- app/schemas: csv, mapping, reports, reconciliation
- app/services: csv_parser, reconciliation_engine, report_generator, temp_file_manager
