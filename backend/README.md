# VendorLens Backend

FastAPI backend for VendorLens supplier due-diligence investigations. Designed to work with the existing VendorLens frontend API contracts.

## Features

- `GET /health`
- `POST /api/investigations`
- `GET /api/investigations`
- `GET /api/investigations/{id}`
- `POST /api/compare`
- SerpApi Google Search for each submitted claim
- Supplementary Google News search
- Optional Gemini semantic claim analysis
- Conservative fallback that never marks a claim verified from keyword overlap alone
- SQLite persistence
- CORS configuration for local frontend development
- Swagger documentation at `/docs`
- Bounded retries for transient SerpApi timeouts, rate limits, and server errors
- Website normalization for common malformed URLs

## Requirements

- Python 3.10+ (Python 3.11 recommended)
- SerpApi API key for live searches
- Optional Gemini API key for semantic claim analysis

## Windows setup

Extract the ZIP, open Command Prompt in the `vendorlens_backend` folder, and run:

```bat
py -3.11 -m venv .venv
.venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
copy .env.example .env
```

Open `.env` and add your own keys:

```env
SERPAPI_API_KEY=your_serpapi_key_here
GEMINI_API_KEY=your_gemini_key_here
GEMINI_MODEL=gemini-2.5-flash
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173
CORS_ORIGIN_REGEX=^https?://(localhost|127\.0\.0\.1)(:\d+)?$
DATABASE_PATH=vendorlens.db
MAX_CLAIMS_PER_INVESTIGATION=15
SERPAPI_TIMEOUT_SECONDS=30
SERPAPI_RETRIES=1
```

`SERPAPI_API_KEY` is required for live investigations. `GEMINI_API_KEY` is optional. Do not place keys in frontend environment variables or commit `.env` to Git.

Start the API:

```bat
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Or run `run_windows.bat`.

## Connect the frontend

In the frontend project root, create or edit `.env.local`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Restart the frontend development server after changing environment variables. If your frontend runs on a hosted Lovable URL, the backend must be deployed or securely tunneled and `CORS_ORIGINS` / `CORS_ORIGIN_REGEX` must explicitly allow that frontend origin. A hosted page generally cannot reach your computer's `127.0.0.1` backend.

## Verify

- Health: http://127.0.0.1:8000/health
- API docs: http://127.0.0.1:8000/docs

## Important behavior

- Search snippets are leads, not definitive proof. Open original sources before making decisions.
- If SerpApi is not configured, live investigation returns a clear 503 instead of fake results.
- Without Gemini, keyword-based fallback analysis is conservative and does not mark claims verified or contradicted solely from token overlap.
- The backend retries transient search failures a bounded number of times. Persistent provider timeouts can still occur.
- This is a prototype and not a legal/compliance opinion or guarantee of supplier legitimacy.
