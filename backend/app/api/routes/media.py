"""
Media upload router — handles crop and disease photo uploads.
"""
import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from app.core.security import get_current_user

router = APIRouter()

APP_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UPLOAD_DIR = os.path.join(APP_DIR, "static", "uploads")

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user)
):
    # Validate MIME type to ensure it is an image
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image file uploads are supported.")

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # Generate unique name for the uploaded file
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4().hex}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    try:
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save image file: {str(e)}")

    return {"url": f"/static/uploads/{unique_filename}", "filename": unique_filename}
