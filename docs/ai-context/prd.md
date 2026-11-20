# FinSync Product Requirements Document (PRD)

## Product Summary
FinSync is a B2B FinTech/DataOps financial reconciliation and data migration validation platform. It compares source and destination datasets (typically CSV exports) and reports discrepancies, missing/unexpected records, duplicates, and invalid values with deterministic, auditable results.

## Target Domain
- Financial reconciliation and data migration validation
- B2B SaaS / DataOps workflows

## Core User Workflows
- Projects: create/manage migration projects
- 6-step Reconciliation Wizard: session details, CSV upload, column mapping, validation rules, review, run & results
- Results & Discrepancy Drawer: inspect record-level field comparisons
- Data Explorer: browse datasets
- Reports & Formula-Safe Exports: CSV reports with formula injection protection
- History: past reconciliation sessions
- Settings: workspace preferences, theme, attribution

## Key Domain Behaviors
- Exact decimal matching with configurable numeric tolerance
- Leading-zero string ID preservation
- Primary record statuses: MATCHED, MISMATCHED, MISSING_IN_DESTINATION, UNEXPECTED_IN_DESTINATION, DUPLICATE, INVALID
- Overall run statuses: PASSED, PASSED_WITH_WARNINGS, FAILED
- Zero-retention CSV processing; local-first browser persistence
