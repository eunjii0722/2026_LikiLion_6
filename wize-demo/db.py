import sqlite3
import os
from contextlib import contextmanager

DB_PATH = "wize.db"

def init():
    with get_conn() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id          TEXT PRIMARY KEY,
                email       TEXT UNIQUE NOT NULL,
                name        TEXT,
                usage_count INTEGER DEFAULT 0,
                created_at  TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS external_accounts (
                id            TEXT PRIMARY KEY,
                user_id       TEXT REFERENCES users(id),
                provider      TEXT,
                token_data    TEXT,
                account_email TEXT,
                updated_at    TEXT DEFAULT (datetime('now')),
                created_at    TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS workflows (
                id            TEXT PRIMARY KEY,
                user_id       TEXT REFERENCES users(id),
                title         TEXT NOT NULL,
                description   TEXT,
                is_active     INTEGER DEFAULT 1,
                origin_prompt TEXT,
                created_at    TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS workflow_step (
                id          TEXT PRIMARY KEY,
                workflow_id TEXT REFERENCES workflows(id),
                step_order  INTEGER,
                service     TEXT,
                step_type   TEXT,
                config      TEXT
            );

            CREATE TABLE IF NOT EXISTS execution_runs (
                id          TEXT PRIMARY KEY,
                workflow_id TEXT REFERENCES workflows(id),
                status      TEXT,
                started_at  TEXT DEFAULT (datetime('now')),
                summary     TEXT
            );

            CREATE TABLE IF NOT EXISTS step_logs (
                id          TEXT PRIMARY KEY,
                workflow_id TEXT REFERENCES workflows(id),
                run_id      TEXT REFERENCES execution_runs(id),
                step_id     TEXT REFERENCES workflow_step(id),
                status      TEXT,
                error_log   TEXT,
                executed_at TEXT DEFAULT (datetime('now'))
            );
        """)
        conn.execute(
            "INSERT OR IGNORE INTO users (id, email, name) VALUES (?, ?, ?)",
            (os.getenv("DEMO_USER_ID", "demo-user-001"), "demo@wize.app", "데모")
        )

@contextmanager
def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()
