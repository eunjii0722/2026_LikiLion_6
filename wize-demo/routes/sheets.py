from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.google_sheets import create_sheet

router = APIRouter()


class CreateSheetRequest(BaseModel):
    title: str = "수강신청 응답"
    headers: list[str] = ["제출일", "이름", "이메일", "연락처", "신청 과정"]


@router.post("/sheets/create")
def create_new_sheet(req: CreateSheetRequest):
    try:
        result = create_sheet(req.title, req.headers)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
