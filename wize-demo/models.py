from pydantic import BaseModel
from typing import List, Literal

class ParseRequest(BaseModel):
    text: str

class TriggerConfig(BaseModel):
    service: Literal["google_form"]
    form_id: str = ""

class ActionStep(BaseModel):
    order: int
    service: Literal["google_sheets", "gmail"]
    config: dict

class WorkflowDraft(BaseModel):
    trigger: TriggerConfig
    actions: List[ActionStep]

class ParseResponse(BaseModel):
    workflow: WorkflowDraft

class CreateWorkflowRequest(BaseModel):
    title: str
    origin_prompt: str
    trigger_config: dict   # form_id, linked_sheet_id
    actions: List[ActionStep]

class WorkflowResponse(BaseModel):
    workflow_id: str
    watch_expiration: str
