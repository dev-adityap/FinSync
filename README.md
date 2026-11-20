# FinSync — Deterministic Financial Reconciliation & Data Migration Validation

**FinSync** is a local-first B2B FinTech & DataOps SaaS platform for deterministic ledger reconciliation, schema validation, and data migration auditing. It combines instant browser-side persistence (`IndexedDB` via Dexie.js) with a stateless, zero-retention `FastAPI` + `Pandas` validation engine.

---

## Core Capabilities

* **Deterministic Reconciliation Engine:** Exact `Decimal`-precision numeric comparisons with configurable tolerances (e.g., `0.01`), leading-zero string ID preservation (e.g., `00101`), and field-level discrepancy detection.
* **6-Step Guided Reconciliation Wizard:**
  1. **Create Session** — Project assignment, source/destination metadata, and `Tab`-to-fill smart placeholders.
  2. **Upload CSVs** — Instant schema preview, row counts, and type detection with built-in sample datasets.
  3. **Column Mapping** — Interactive source-to-destination mapping with 
  unique key validation and data type assignment (`String`, `Number`, `Currency (Decimal)`, `Date`, `Email`).
  4. **Validation Rules** — Configurable tolerances, duplicate detection, and format checks.
  5. **Review** — Complete pre-flight configuration summary.
  6. **Run & Results** — Real-time execution with record-level status classification (`MATCHED`, `MISMATCHED`, `MISSING_IN_DESTINATION`, `UNEXPECTED_IN_DESTINATION`, `DUPLICATE`, `INVALID`).
* **Local-First Architecture:** Workspaces, projects, reconciliation history, and UI preferences persist locally in `IndexedDB`. Uploaded CSVs are processed statelessly and cleaned up immediately after validation.
* **Audit & Export Suite:** Side-by-side record inspection drawer, searchable Data Explorer, printable audit views (`@media print`), and formula-safe CSV report downloads.
* **Production SaaS UX:** Obsidian-framed workspace with dual Light/Dark theme support, `Ctrl+K` global workspace search, confirmation modals, responsive mobile drawers, and SEO/legal pages (`/privacy`, `/terms`, `/thank-you`, `404`).

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, TypeScript, Vite, Tailwind CSS v4, Dexie.js (IndexedDB), Recharts, Lucide React |
| **Backend** | Python, FastAPI, Pandas, Uvicorn, Pytest |
| **Deployment** | Vercel (Frontend SPA) + Render (FastAPI Web Service) |

---

## Project Structure

```text
FinSync/
├── backend/                  # FastAPI stateless reconciliation & CSV engine
│   ├── app/                  # API routes (/api/health, /api/preview, /api/reconcile, /api/export)
│   ├── tests/                # Pytest suite
│   ├── .env.example          # Backend environment variable template
│   └── requirements.txt
├── frontend/                 # React + TypeScript + Vite local-first web app
│   ├── public/               # Sample CSVs, favicons, robots.txt, sitemap.xml, webmanifest
│   ├── src/
│   │   ├── components/       # UI primitives, AppShell, RecordInspectionDrawer, modals
│   │   ├── context/          # WorkspaceContext (IndexedDB state & theme persistence)
│   │   ├── db/               # Dexie schema & repository layer
│   │   ├── hooks/            # Custom hooks (usePageMeta, etc.)
│   │   ├── pages/            # Landing, Dashboard, 6-Step Wizard, Results, Explorer, Reports, History, Settings, Legal
│   │   ├── services/         # FastAPI client & reconciliation orchestration
│   │   ├── styles/           # Tailwind v4 + dual-theme CSS variables + print stylesheet
│   │   └── utils/            # Analytics & UTM attribution helpers
│   ├── .env.example          # Frontend environment variable template
│   └── vercel.json           # SPA rewrite rules
└── docs/
    └── ai-context/           # Structured product, architecture, rules, design, and task docs