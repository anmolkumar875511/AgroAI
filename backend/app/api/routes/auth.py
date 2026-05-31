from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.schemas import LoginRequest, TokenResponse, UserOut
from app.services.auth_service import login as auth_login

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    return await auth_login(req, db)


@router.get("/me", response_model=UserOut)
async def me(current_user=Depends(get_current_user)):
    return current_user
