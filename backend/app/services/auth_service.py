from datetime import datetime
from typing import Optional
from bson import ObjectId
from fastapi import HTTPException, status

from app.core.database import get_collection
from app.core.security import verify_password, get_password_hash, create_access_token
from app.schemas.schemas import RegisterRequest, LoginRequest


async def register_user(data: RegisterRequest) -> dict:
    users = get_collection("users")

    existing = await users.find_one({"email": data.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user_doc = {
        "name": data.name,
        "email": data.email,
        "hashed_password": get_password_hash(data.password),
        "employee_id": data.employee_id,
        "role": data.role,
        "territory": data.territory,
        "territory_id": data.territory_id,
        "region_id": data.region_id,
        "theme": "dark",
        "language": "English",
        "notifications": {
            "pestAlerts": True,
            "stockAlerts": True,
            "visitReminders": False,
            "weeklyReports": True,
        },
        "sync_enabled": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = await users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    return _serialize_user(user_doc)


async def login_user(data: LoginRequest) -> dict:
    users = get_collection("users")
    user = await users.find_one({"email": data.email})
    print(data.email, data.password, user)

    if not user or not verify_password(data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(
        data={"sub": str(user["_id"]), "email": user["email"], "role": user["role"]}
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": _serialize_user(user),
    }


async def get_user_by_id(user_id: str) -> Optional[dict]:
    users = get_collection("users")
    user = await users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return None
    return _serialize_user(user)


async def update_user_settings(user_id: str, updates: dict) -> dict:
    users = get_collection("users")
    updates["updated_at"] = datetime.utcnow()
    await users.update_one({"_id": ObjectId(user_id)}, {"$set": updates})
    user = await users.find_one({"_id": ObjectId(user_id)})
    return _serialize_user(user)


def _serialize_user(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "employee_id": user.get("employee_id", ""),
        "role": user.get("role", "field_agent"),
        "territory": user.get("territory", ""),
        "territory_id": user.get("territory_id", ""),
        "region_id": user.get("region_id", "br"),
        "theme": user.get("theme", "dark"),
        "language": user.get("language", "English"),
        "notifications": user.get("notifications", {}),
        "sync_enabled": user.get("sync_enabled", True),
    }
