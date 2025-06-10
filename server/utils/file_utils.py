import os
import uuid
from fastapi import UploadFile
from typing import Optional
import shutil

# Create uploads directory if it doesn't exist
UPLOAD_DIR = "uploads/avatars"
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def save_upload_file(upload_file: UploadFile, user_id: str) -> str:
    """
    Save an uploaded file and return the file path
    """
    # Generate a unique filename
    file_ext = os.path.splitext(upload_file.filename or "")
    filename = f"{user_id}_{uuid.uuid4()}{file_ext[1]}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    # Save the file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    
    return file_path

def delete_file(file_path: str) -> bool:
    """
    Delete a file if it exists
    """
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
    except Exception:
        pass
    return False
