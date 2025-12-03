from fastapi import APIRouter
from ai.ai_agent import ask_ai

router = APIRouter()

@router.post("/query")
def ai_query(payload: dict):
    message = payload.get("message", "")
    return { "response": ask_ai(message) }