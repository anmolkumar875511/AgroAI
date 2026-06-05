"""
WebSocket router — handles real-time agent locations tracking and push notification alerts.
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status
from jose import jwt, JWTError
from sqlalchemy import select
from datetime import datetime
import json
import logging

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.models.models import User

logger = logging.getLogger("agroai_websocket")
router = APIRouter()

# Active connection pools: user_id (int) -> connection (WebSocket)
agent_connections = {}
manager_connections = {}

# Live reps tracking dictionary: user_id -> dict
# Contains: {"id": user_id, "name": name, "territory": territory, "lat": lat, "lng": lng, "status": "Active", "lastActive": "10:45 AM"}
live_agent_locations = {}

async def broadcast_to_managers(payload: dict):
    """Sends a payload to all connected manager/admin receivers."""
    closed_connections = []
    for uid, ws in list(manager_connections.items()):
        try:
            await ws.send_json(payload)
        except Exception:
            closed_connections.append(uid)
            
    # Cleanup any stale connections
    for uid in closed_connections:
        manager_connections.pop(uid, None)

@router.websocket("/")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
        
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        user_id = int(user_id)
    except (JWTError, ValueError):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # Fetch user details
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user or not user.is_active:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
            
        role = user.role
        username = user.name
        territory = user.territory or "N/A"

    # Register in appropriate pool
    if role in ("manager", "admin"):
        manager_connections[user_id] = websocket
        # Send current live rep locations immediately on connection
        try:
            await websocket.send_json({
                "type": "reps_list",
                "reps": list(live_agent_locations.values())
            })
        except Exception:
            manager_connections.pop(user_id, None)
            return
    else:
        agent_connections[user_id] = websocket

    try:
        while True:
            # Wait for messages from the connected client
            data_str = await websocket.receive_text()
            try:
                data = json.loads(data_str)
            except Exception:
                continue

            msg_type = data.get("type")
            if msg_type == "location" and role == "agent":
                lat = data.get("lat")
                lng = data.get("lng")
                if lat is not None and lng is not None:
                    # Update live telemetry info
                    live_agent_locations[user_id] = {
                        "id": user_id,
                        "name": username,
                        "territory": territory,
                        "lat": float(lat),
                        "lng": float(lng),
                        "status": "Active",
                        "lastActive": datetime.now().strftime("%I:%M %p"),
                        "timestamp": datetime.now().isoformat()
                    }
                    
                    # Broadcast telemetry updates to all managers
                    await broadcast_to_managers({
                        "type": "rep_location_update",
                        "rep": live_agent_locations[user_id]
                    })
                    
            elif msg_type == "ping":
                try:
                    await websocket.send_json({"type": "pong"})
                except Exception:
                    break

    except WebSocketDisconnect:
        pass
    finally:
        # Cleanup connection registration
        agent_connections.pop(user_id, None)
        manager_connections.pop(user_id, None)
        
        # Mark user as offline / Idle in tracking
        if user_id in live_agent_locations:
            live_agent_locations[user_id]["status"] = "Idle"
            await broadcast_to_managers({
                "type": "rep_location_update",
                "rep": live_agent_locations[user_id]
            })
