import os
from pathlib import Path
from dotenv import load_dotenv

# Always load the backend's own .env, even if Uvicorn is launched from another folder.
BACKEND_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BACKEND_DIR / ".env", override=False)

def csv_env(name: str, default: str) -> list[str]:
    raw = os.getenv(name, default)
    return [item.strip().rstrip("/") for item in raw.split(",") if item.strip()]

SERPAPI_API_KEY = os.getenv("SERPAPI_API_KEY", "").strip()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip() or "gemini-2.5-flash"
CORS_ORIGINS = csv_env(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173",
)
# Allows local development servers using an alternate port, while remaining local-only by default.
# For a deployed frontend, set CORS_ORIGIN_REGEX to a regex matching that specific trusted origin.
CORS_ORIGIN_REGEX = os.getenv(
    "CORS_ORIGIN_REGEX",
    r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
).strip() or None
DATABASE_PATH_RAW = os.getenv("DATABASE_PATH", "vendorlens.db").strip() or "vendorlens.db"
DATABASE_PATH = str((BACKEND_DIR / DATABASE_PATH_RAW).resolve()) if not os.path.isabs(DATABASE_PATH_RAW) else DATABASE_PATH_RAW
MAX_CLAIMS = max(1, min(50, int(os.getenv("MAX_CLAIMS_PER_INVESTIGATION", "15"))))
SERPAPI_TIMEOUT = max(5, min(90, int(os.getenv("SERPAPI_TIMEOUT_SECONDS", "30"))))
SERPAPI_RETRIES = max(0, min(3, int(os.getenv("SERPAPI_RETRIES", "1"))))
