"""
Admin API router — handles system user CRUD operations.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.core.security import require_admin, hash_password
from app.models.models import User, Territory
from app.schemas.schemas import UserOut, UserCreateRequest, UserUpdateRequest

router = APIRouter()

@router.get("/users", response_model=List[UserOut])
async def list_users(
    db: AsyncSession = Depends(get_db),
    _ = Depends(require_admin)
):
    result = await db.execute(select(User).order_by(User.id.desc()))
    users = result.scalars().all()
    return users

@router.post("/users", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_user(
    req: UserCreateRequest,
    db: AsyncSession = Depends(get_db),
    _ = Depends(require_admin)
):
    # Check if email is already taken
    email_check = await db.execute(select(User).where(User.email == req.email))
    if email_check.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail="A user with this email address already exists."
        )
    
    # Resolve territory name
    territory_name = None
    if req.territory_id:
        t_res = await db.execute(select(Territory).where(Territory.id == req.territory_id))
        t_obj = t_res.scalar_one_or_none()
        if t_obj:
            territory_name = t_obj.name

    new_user = User(
        email=req.email,
        hashed_password=hash_password(req.password),
        name=req.name,
        role=req.role,
        territory_id=req.territory_id,
        territory=territory_name,
        employee_id=req.employee_id,
        phone=req.phone,
        is_active=True,
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@router.put("/users/{user_id}", response_model=UserOut)
async def update_user(
    user_id: int,
    req: UserUpdateRequest,
    db: AsyncSession = Depends(get_db),
    _ = Depends(require_admin)
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
        
    if req.email is not None and req.email != user.email:
        email_check = await db.execute(select(User).where(User.email == req.email))
        if email_check.scalar_one_or_none():
            raise HTTPException(
                status_code=400,
                detail="A user with this email address already exists."
            )
        user.email = req.email

    if req.name is not None:
        user.name = req.name
    if req.role is not None:
        user.role = req.role
    if req.employee_id is not None:
        user.employee_id = req.employee_id
    if req.phone is not None:
        user.phone = req.phone
    if req.is_active is not None:
        user.is_active = req.is_active
    if req.password is not None and req.password.strip():
        user.hashed_password = hash_password(req.password)
        
    if req.territory_id is not None:
        user.territory_id = req.territory_id
        if req.territory_id:
            t_res = await db.execute(select(Territory).where(Territory.id == req.territory_id))
            t_obj = t_res.scalar_one_or_none()
            user.territory = t_obj.name if t_obj else None
        else:
            user.territory = None

    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    _ = Depends(require_admin)
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
        
    # Standard admin user protection - cannot delete oneself or the seeded admin
    if user.email == "admin@agroai.com":
        raise HTTPException(status_code=400, detail="The default admin user cannot be deleted.")

    await db.delete(user)
    await db.commit()
    return {"status": "ok", "message": "User deleted successfully."}
