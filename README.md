# FinSync - Intelligent Data Integration & Migration Validator

**Every Record. Every Field. Every Detail. In Sync.**

FinSync is a professional data integration and migration validation platform that allows users to compare datasets exported from two different systems and detect discrepancies before accepting a migration.

## Features

- **Public Marketing Website** - Professional landing page with features, use cases, and documentation
- **Authentication UI Placeholders** - Login, registration, and forgot password pages (UI only - no actual authentication)
- **Anonymous Workspace** - Use the application without creating an account
- **Project Management** - Create, edit, and delete projects to organize reconciliation sessions
- **CSV Upload** - Drag and drop source and destination CSV files (up to 20MB)
- **Column Mapping** - Intelligent field mapping with auto-suggestions and manual override
- **Validation Configuration** - Configurable numeric tolerance, case sensitivity, whitespace handling, and more
- **Real Reconciliation Engine** - Python/FastAPI backend with Pandas for accurate data comparison
- **Results Dashboard** - Interactive results with filtering, sorting, and record-level drill-down
- **Data Explorer** - Inspect source and destination datasets
- **Reports** - Export CSV reports (complete, mismatches, missing, unexpected, duplicates, invalid, summary)
- **Reconciliation History** - View and manage past reconciliation sessions
- **Settings** - Theme selection, validation defaults, workspace backup/restore
- **Liquid Glass Design** - Premium glassmorphism UI with dark/light theme support
- **Local-First Persistence** - All data stored in browser IndexedDB
- **Responsive Design** - Works on desktop, tablet, and mobile

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- Lucide React icons
- React Router for navigation
- Recharts for data visualization
- Axios for API communication
- React Hook Form + Zod for form validation
- TanStack Table for data tables
- Dexie.js for IndexedDB persistence
- Framer Motion for animations

### Backend
- FastAPI
- Python 3.12
- Pandas for data processing
- Pydantic for data validation

### Testing
- Pytest (backend)
- Vitest (frontend)
- React Testing Library

## Project Structure

```
FinSync/
├── backend/
│   ├── main.py              # FastAPI application with reconciliation engine
│   ├── requirements.txt     # Python dependencies
│   ├── Dockerfile           # Backend container
│   ├── .env.example         # Backend environment variables
│   └── tests/
│       └── test_reconciliation.py  # Backend tests
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/          # App shell, navbar, sidebar
│   │   │   └── ui/              # Glass components library
│   │   ├── context/             # React context providers
│   │   ├── pages/               # Application pages
│   │   │   ├── app/             # Authenticated app pages
│   │   │   ├── auth/            # Authentication pages
│   │   │   └── *.tsx            # Public pages
│   │   ├── services/            # API service layer
│   │   ├── types/               # TypeScript type definitions
│   │   ├── utils/               # Utility functions
│   │   ├── App.tsx              # Main app with routing
│   │   └── main.tsx             # Entry point
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── sample_source.csv
│   │   └── sample_destination.csv
│   ├── tests/
│   │   └── utils.test.ts        # Frontend tests
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.ts
├── docker-compose.yml       # Multi-container deployment
├── .gitignore
└── README.md
```

## Installation

### Prerequisites

- Node.js 18+ and npm
- Python 3.12+
- pip

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   source venv/bin/activate  # macOS/Linux
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env as needed
   ```

5. Start the backend:
   ```bash
   python main.py
   ```
   The backend will be available at `http://localhost:8000`
   API documentation at `http://localhost:8000/api/docs`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000`

## Available Scripts

### Frontend
| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |
| `npm test` | Run Vitest tests |

### Backend
| Script | Description |
|--------|-------------|
| `python main.py` | Start the FastAPI server |
| `python -m pytest tests/` | Run backend tests |

## Authentication

**Important:** Authentication is explicitly excluded from this release. The login, registration, and forgot password pages are UI placeholders only. No credentials are sent, stored, or processed.

To use the application, click "Continue without an account" or "Explore Demo" on any authentication page. This opens the application in anonymous workspace mode.

## Anonymous Workspace

FinSync uses a local-first architecture where all data is stored in your browser's IndexedDB:

- Projects, sessions, and reconciliation results persist locally
- Data does not synchronize across browsers or devices
- Clearing browser data will remove all workspace data
- You can export/import workspace backups in Settings

**Limitation:** This anonymous workspace mode is not suitable for confidential enterprise financial data or regulated datasets.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/version` | GET | Version information |
| `/api/csv/preview` | POST | Preview CSV file contents |
| `/api/csv/validate` | POST | Validate CSV file structure |
| `/api/mapping/preview` | POST | Get column names from both files |
| `/api/reconciliation/run` | POST | Execute reconciliation |
| `/api/reconciliation/validate-config` | POST | Validate reconciliation config |
| `/api/reports/{type}` | POST | Generate CSV report |

## Sample Data

Sample CSV files are provided in `frontend/public/`:
- `sample_source.csv` - Source dataset
- `sample_destination.csv` - Destination dataset

The sample scenario produces:
- 3 matching records (101, 102, 105)
- 1 amount mismatch (103: 8000 vs 800)
- 1 missing destination record (104)
- 1 unexpected destination record (106)

## Deployment

### Docker Compose

```bash
docker-compose up -d
```

### Frontend (Vercel/Netlify)

Build the frontend:
```bash
cd frontend
npm run build
```

Deploy the `dist/` folder to your preferred static hosting provider.

### Backend (Render/Railway/Heroku)

Deploy the backend directory with a Python 3.12 runtime. Set the `CORS_ORIGINS` environment variable to your frontend domain.

## Testing

### Backend Tests
```bash
cd backend
python -m pytest tests/ -v
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Production Build

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
# Deploy with your preferred Python hosting provider
```

## Security

- Files are processed in-memory and not permanently stored on the server
- Temporary files are cleaned up after processing
- CORS is configured with allowlist
- File upload size limit: 20MB
- No credentials are stored or transmitted
- No secret keys in the repository

## Limitations

- Authentication is not implemented (UI placeholders only)
- Data persists only in the current browser (IndexedDB)
- No cross-device synchronization
- Not suitable for confidential enterprise financial data
- CSV files only (up to 20MB)

## License

MIT License