from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import db, json
from routes import parse, workflows, webhook, sheets

app = FastAPI(title="WIZE Demo")
db.init()

app.include_router(parse.router)
app.include_router(workflows.router)
app.include_router(webhook.router)
app.include_router(sheets.router)

@app.get("/debug/db")
def debug_db(deactivate: str = ""):
    with db.get_conn() as conn:
        if deactivate:
            conn.execute("UPDATE workflows SET is_active = 0 WHERE id = ?", (deactivate,))
        wfs = conn.execute("SELECT id, title, is_active, created_at FROM workflows ORDER BY created_at DESC").fetchall()
        steps = conn.execute("SELECT workflow_id, service, step_type, config FROM workflow_step ORDER BY workflow_id, step_order").fetchall()
        runs = conn.execute("SELECT * FROM execution_runs ORDER BY started_at DESC LIMIT 10").fetchall()
        logs = conn.execute("SELECT * FROM step_logs ORDER BY executed_at DESC LIMIT 20").fetchall()
    return {
        "deactivated": deactivate or None,
        "workflows": [dict(w) for w in wfs],
        "steps": [
            {**dict(s), "config": json.loads(s["config"])}
            for s in steps
        ],
        "execution_runs": [dict(r) for r in runs],
        "step_logs": [dict(l) for l in logs],
    }

app.mount("/", StaticFiles(directory="frontend", html=True), name="static")
