from fastapi import APIRouter
from models import ParseRequest
from services.claude import parse_natural_language

router = APIRouter()

@router.post("/parse")
def parse(req: ParseRequest):
    workflow = parse_natural_language(req.text)
    return {"workflow": workflow}
