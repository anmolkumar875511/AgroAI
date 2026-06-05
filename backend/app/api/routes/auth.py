from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.schemas import LoginRequest, TokenResponse, UserOut
from app.services.auth_service import login as auth_login
from app.core.limiter import login_limiter

router = APIRouter()


@router.post("/login", response_model=TokenResponse, dependencies=[Depends(login_limiter)])
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    return await auth_login(req, db)


@router.get("/me", response_model=UserOut)
async def me(current_user=Depends(get_current_user)):
    return current_user


from pydantic import BaseModel
import random
import logging
from sqlalchemy import select
from app.models.models import User
from app.core.security import hash_password

logger = logging.getLogger("agroai_auth")

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    token: str
    new_password: str

RECOVERY_TOKENS = {}

@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    if not user:
        return {"status": "ok", "message": "If the account exists, a recovery code has been generated."}
        
    token = f"{random.randint(100000, 999999)}"
    RECOVERY_TOKENS[req.email.lower()] = token
    
    print(f"\n[PASSWORD RESET TOKEN GENERATED FOR {req.email.upper()}]: {token}\n")
    logger.info(f"Password reset token for {req.email}: {token}")
    
    return {
        "status": "ok", 
        "message": "Verification code generated.", 
        "developer_token": token
    }

@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    email_key = req.email.lower()
    expected_token = RECOVERY_TOKENS.get(email_key)
    
    if not expected_token or expected_token != req.token:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Invalid or expired verification token.")
        
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User account not found.")
        
    user.hashed_password = hash_password(req.new_password)
    db.add(user)
    await db.commit()
    
    if email_key in RECOVERY_TOKENS:
        del RECOVERY_TOKENS[email_key]
        
    return {"status": "ok", "message": "Password has been successfully updated."}
