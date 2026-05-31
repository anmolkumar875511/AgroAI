"""AI Chat route — delegates to chat_service."""
from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.schemas.schemas import ChatRequest, ChatResponse
from app.services.chat_service import get_ai_response

router = APIRouter()


@router.post("/", response_model=ChatResponse)
async def chat(req: ChatRequest, current_user=Depends(get_current_user)):
    reply = await get_ai_response(req.messages, req.territory_id)
    return ChatResponse(reply=reply)
