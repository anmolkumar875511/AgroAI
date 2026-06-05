"""AI Chat route — delegates to chat_service."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.schemas import ChatRequest, ChatResponse
from app.services.chat_service import get_ai_response
from app.core.limiter import chat_limiter

router = APIRouter()


@router.post("/", response_model=ChatResponse, dependencies=[Depends(chat_limiter)])
async def chat(
    req: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    t_id = req.territory_id or current_user.territory_id
    reply = await get_ai_response(req.messages, t_id, db)
    return ChatResponse(reply=reply)
