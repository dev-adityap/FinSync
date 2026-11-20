# FinSync — Deterministic Financial Reconciliation & Data Migration Validation

**FinSync** is a local-first B2B FinTech & DataOps SaaS platform for deterministic ledger reconciliation, schema validation, and data migration auditing. It combines instant browser-side persistence (`IndexedDB` via Dexie.js) with a stateless, zero-retention `FastAPI` + `Pandas` validation engine.

---

## Live Links

* **Live Application:** [https://fin-sync-ten.vercel.app/](https://fin-sync-ten.vercel.app/)
* **Live Workspace Demo:** [https://fin-sync-ten.vercel.app/app](https://fin-sync-ten.vercel.app/app)
* **Backend API Health Check:** [https://finsync-udhf.onrender.com/api/health](https://finsync-udhf.onrender.com/api/health)
* **GitHub Repository:** [https://github.com/dev-adityap/FinSync](https://github.com/dev-adityap/FinSync)

> **Note:** The backend is hosted on Render's free tier and may take ~30–50 seconds to wake up on the very first API request after a period of inactivity.

---

## Core Capabilities

* **Deterministic Reconciliation Engine:** Exact `Decimal`-precision numeric comparisons with configurable tolerances (e.g., `0.01`), leading-zero string ID preservation (e.g., `00101`), and field-level discrepancy detection.
* **6-Step Guided Reconciliation Wizard:**
  1. **Create Session** — Project assignment, source/destination metadata, and `Tab`-to-fill smart placeholders.
  2. **Upload CSVs** — Instant schema preview, row counts, and type detection with built-in sample datasets.
  3. **Column Mapping** — Interactive source-to-destination mapping with unique key validation and data type assignment (`String`, `Number`, `Currency (Decimal)`, `Date`, `Email`).
  4. **Validation Rules** — Configurable numeric tolerances, duplicate detection, and strict format validation.
  5. **Review** — Complete pre-flight configuration summary.
  6. **Run & Results** — Real-time execution with record-level primary status classification (`MATCHED`, `MISMATCHED`, `MISSING_IN_DESTINATION`, `UNEXPECTED_IN_DESTINATION`, `DUPLICATE`, `INVALID`).
* **Local-First Architecture:** Workspaces, projects, reconciliation history, and UI preferences persist locally in `IndexedDB`. Uploaded CSVs are processed statelessly and cleaned up immediately after validation.
* **Audit & Export Suite:** Side-by-side record inspection drawer, searchable Data Explorer, printable audit views (`@media print`), and formula-safe CSV report downloads.
* **Production SaaS UX:** Obsidian-framed workspace with persistent Light/Dark theme support, `Ctrl+K` global workspace search, confirmation modals, responsive mobile drawers, and SEO/legal pages (`/privacy`, `/terms`, `/thank-you`, `404`).

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
│   ├── app/                  # API routes (/api/health, /api/csv/preview, /api/reconcile, /api/export)
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
```

---

## Local Development Setup

### 1. Start the Backend (FastAPI)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Verify the local API health endpoint at `http://127.0.0.1:8000/api/health`.

### 2. Start the Frontend (Vite + React)

```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

Open `http://localhost:5173` in your browser, click **Explore Demo**, and run **Try Sample Reconciliation** to test the full pipeline end to end.

---

## Verification & Testing

```powershell
# Backend tests
cd backend
.\.venv\Scripts\python.exe -m pytest

# Frontend type-check & production build
cd frontend
npx tsc --noEmit
npm run build
```

---

## Production Deployment

### Backend (Render)
* **Root Directory:** `backend`
* **Build Command:** `pip install -r requirements.txt`
* **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
* **Environment Variables:**
  * `ENVIRONMENT=production`
  * `CORS_ORIGINS=https://fin-sync-ten.vercel.app`

### Frontend (Vercel)
* **Root Directory:** `frontend`
* **Framework Preset:** `Vite`
* **Build Command:** `npm run build`
* **Output Directory:** `dist`
* **Environment Variables:**
  * `VITE_API_BASE_URL=https://finsync-udhf.onrender.com`