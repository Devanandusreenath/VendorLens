import json
import os
import sqlite3
from typing import Any
from .config import DATABASE_PATH

def _connect() -> sqlite3.Connection:
    folder = os.path.dirname(os.path.abspath(DATABASE_PATH))
    os.makedirs(folder, exist_ok=True)
    conn = sqlite3.connect(DATABASE_PATH, timeout=15)
    conn.row_factory = sqlite3.Row
    return conn

def init_db() -> None:
    with _connect() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS investigations (
                id TEXT PRIMARY KEY,
                created_at TEXT NOT NULL,
                status TEXT NOT NULL,
                supplier_name TEXT NOT NULL,
                category TEXT NOT NULL,
                payload_json TEXT NOT NULL
            )
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_investigations_created ON investigations(created_at DESC)")

def save_investigation(data: dict[str, Any]) -> None:
    with _connect() as conn:
        conn.execute(
            """INSERT OR REPLACE INTO investigations
            (id, created_at, status, supplier_name, category, payload_json)
            VALUES (?, ?, ?, ?, ?, ?)""",
            (data["id"], data["created_at"], data["status"], data["supplier"]["name"],
             data["supplier"]["category"], json.dumps(data, ensure_ascii=False)),
        )

def get_investigation(inv_id: str) -> dict[str, Any] | None:
    with _connect() as conn:
        row = conn.execute("SELECT payload_json FROM investigations WHERE id = ?", (inv_id,)).fetchone()
    return json.loads(row["payload_json"]) if row else None

def list_investigations() -> list[dict[str, Any]]:
    with _connect() as conn:
        rows = conn.execute("SELECT payload_json FROM investigations ORDER BY created_at DESC").fetchall()
    return [json.loads(row["payload_json"]) for row in rows]
