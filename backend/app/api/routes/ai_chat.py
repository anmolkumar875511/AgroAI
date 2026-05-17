from fastapi import APIRouter, Depends, Query
from app.core.security import get_current_user
from app.schemas.schemas import ChatRequest, ChatResponse
from app.services.chat_service import handle_chat, get_chat_history
from datetime import datetime

router = APIRouter()


@router.post("/", response_model=ChatResponse, summary="Send a message to AgroAI assistant")
async def chat(
    data: ChatRequest,
    current_user: dict = Depends(get_current_user),
):
    response = await handle_chat(
        message=data.message,
        session_id=data.session_id,
        user_id=current_user["sub"],
        region=data.region,
    )
    return {
        "response": response,
        "session_id": data.session_id,
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/history", summary="Get chat history for a session")
async def chat_history(
    session_id: str = Query(...),
    limit: int = Query(default=50, le=200),
    current_user: dict = Depends(get_current_user),
):
    return await get_chat_history(
        session_id=session_id,
        user_id=current_user["sub"],
        limit=limit,
    )
