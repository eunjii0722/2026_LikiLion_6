from fastapi import APIRouter, HTTPException
from models import CreateWorkflowRequest
import uuid, json
import db
from services.drive_watch import register_watch

router = APIRouter()

@router.post("/workflows")
def create_workflow(req: CreateWorkflowRequest):
    workflow_id = str(uuid.uuid4())
    user_id = "demo-user-001"

    trigger_step_id = str(uuid.uuid4())
    with db.get_conn() as conn:
        conn.execute(
            "INSERT INTO workflows (id, user_id, title, origin_prompt, is_active) VALUES (?, ?, ?, ?, 0)",
            (workflow_id, user_id, req.title, req.origin_prompt),
        )
        conn.execute(
            "INSERT INTO workflow_step (id, workflow_id, step_order, service, step_type, config) VALUES (?, ?, 0, 'google_form', 'trigger', ?)",
            (trigger_step_id, workflow_id, json.dumps(req.trigger_config)),
        )
        for action in sorted(req.actions, key=lambda a: a.order):
            conn.execute(
                "INSERT INTO workflow_step (id, workflow_id, step_order, service, step_type, config) VALUES (?, ?, ?, ?, 'action', ?)",
                (str(uuid.uuid4()), workflow_id, action.order, action.service, json.dumps(action.config)),
            )

    linked_sheet_id = req.trigger_config.get("linked_sheet_id")
    if not linked_sheet_id:
        raise HTTPException(status_code=400, detail="trigger_config.linked_sheet_id is required")

    watch_result = register_watch(linked_sheet_id, workflow_id)

    updated_config = {**req.trigger_config, **{
        "watch_channel_id": watch_result["channel_id"],
        "watch_expiration": watch_result["expiration"],
    }}
    with db.get_conn() as conn:
        conn.execute(
            "UPDATE workflow_step SET config = ? WHERE id = ?",
            (json.dumps(updated_config), trigger_step_id),
        )
        conn.execute(
            "UPDATE workflows SET is_active = 1 WHERE id = ?",
            (workflow_id,),
        )

    return {"workflow_id": workflow_id, "watch_expiration": watch_result["expiration"]}

@router.get("/workflows/{workflow_id}")
def get_workflow(workflow_id: str):
    with db.get_conn() as conn:
        workflow = conn.execute(
            "SELECT * FROM workflows WHERE id = ?", (workflow_id,)
        ).fetchone()
        logs = conn.execute(
            "SELECT * FROM execution_runs WHERE workflow_id = ? ORDER BY started_at DESC LIMIT 5",
            (workflow_id,),
        ).fetchall()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return {"workflow": dict(workflow), "logs": [dict(l) for l in logs]}

@router.get("/workflows/{workflow_id}/logs")
def get_logs(workflow_id: str):
    with db.get_conn() as conn:
        runs = conn.execute(
            "SELECT * FROM execution_runs WHERE workflow_id = ? ORDER BY started_at DESC",
            (workflow_id,),
        ).fetchall()
    return {"logs": [dict(r) for r in runs]}
