from fastapi import APIRouter, Depends
from app.schemas.schemas import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from app.services.auth_service import register_user, login_user, get_user_by_id
from app.core.security import get_current_user

router = APIRouter()


@router.post("/register", response_model=TokenResponse, summary="Register a new field agent")
async def register(data: RegisterRequest):
    user = await register_user(data)
    from app.core.security import create_access_token
    token = create_access_token({"sub": user["id"], "email": user["email"], "role": user["role"]})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.post("/login", response_model=TokenResponse, summary="Login and get JWT token")
async def login(data: LoginRequest):
    return await login_user(data)


@router.get("/me", response_model=UserResponse, summary="Get current user profile")
async def me(current_user: dict = Depends(get_current_user)):
    user = await get_user_by_id(current_user["sub"])
    if not user:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user
