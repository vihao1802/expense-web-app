import os
from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File, Form
from models.account import Account
from utils.auth import hash_password, verify_password, create_access_token, create_refresh_token
from models.auth import Auth, Token, TokenRefresh
from datetime import timedelta, datetime
from configs.database import db  
from utils.auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES, 
    get_current_active_user, 
    REFRESH_TOKEN_EXPIRE_DAYS, 
    SECRET_KEY, 
    ALGORITHM,
)
from bson import ObjectId
from jose import JWTError, jwt
from typing import Optional
from utils.file_utils import save_upload_file
from pydantic import EmailStr, BaseModel, ValidationError
from datetime import timezone
from utils.password_validation import validate_password

router = APIRouter(prefix="/auth", tags=["Auth"])

class SignupForm(BaseModel):
    name: str
    email: EmailStr
    password: str

@router.post("/signup", response_model=Account)
async def signup(
    name: str = Form(...),
    email: EmailStr = Form(...),
    password: str = Form(...),
    avatar: Optional[UploadFile] = File(None)
):
    # Validate password
    try:
        validate_password(password)
    except HTTPException as e:
        raise e
        
    # Validate the form data using Pydantic model
    try:
        signup_data = SignupForm(name=name, email=email, password=password)
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    # Check if email already exists
    existing = await db.accounts.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create account data
    account_data = {
        "email": email,
        "name": name,
        "password": hash_password(password),
        "role": "user",
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }

    # Handle avatar upload if provided
    if avatar and avatar.filename:
        try:
            # Save the file first without the user ID
            temp_file_path = await save_upload_file(avatar, "temp")
            
            # Insert the user to get the ID
            result = await db.accounts.insert_one(account_data)
            user_id = str(result.inserted_id)
            
            # Rename the file with the user ID
            file_ext = os.path.splitext(temp_file_path)[1]
            new_filename = f"{user_id}{file_ext}"
            new_filepath = os.path.join(os.path.dirname(temp_file_path), new_filename)
            os.rename(temp_file_path, new_filepath)
            
            # Update the user with the avatar path
            avatar_url = f"/{new_filepath.replace('\\', '/')}"  # Convert Windows paths to URL format
            await db.accounts.update_one(
                {"_id": result.inserted_id},
                {"$set": {"avatar": avatar_url}}
            )
            account_data["avatar"] = avatar_url
            
        except Exception as e:
            # Clean up if there's an error
            if 'temp_file_path' in locals() and os.path.exists(temp_file_path):
                os.remove(temp_file_path)
            raise HTTPException(status_code=500, detail=f"Error uploading avatar: {str(e)}")
    else:
        # Insert user without avatar
        result = await db.accounts.insert_one(account_data)
    
    # Get the created user
    created_user = await db.accounts.find_one({"_id": result.inserted_id})
    created_user["id"] = str(created_user["_id"])
    del created_user["password"]
    del created_user["_id"]
    
    return created_user

@router.post("/signin", response_model=Token)
async def signin(auth: Auth):
    account = await db.accounts.find_one({"email": auth.email})

    if not account:
        raise HTTPException(status_code=400, detail="Invalid email")
    
    if not verify_password(auth.password, account["password"]):
        raise HTTPException(status_code=400, detail="Invalid password")
    
    token_data = {
        "sub": str(account["_id"]),
        "email": account["email"],
        "role": account["role"],
        "created_at": str(account["created_at"]),
        "updated_at": str(account["updated_at"]),
    }

    access_token_expires = timedelta(minutes=int(ACCESS_TOKEN_EXPIRE_MINUTES))
    refresh_token_expires = timedelta(days=int(REFRESH_TOKEN_EXPIRE_DAYS))

    access_token = create_access_token(data=token_data, expires_delta=access_token_expires)
    refresh_token = create_refresh_token(data=token_data, expires_delta=refresh_token_expires)

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
    )

@router.post("/refresh", response_model=Token)
async def refresh_token(token_data: TokenRefresh):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(
            token_data.refresh_token, SECRET_KEY, algorithms=[ALGORITHM]
        )
        
        if payload.get("type") != "refresh":
            raise credentials_exception
            
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
            
        user = await db.accounts.find_one({"_id": ObjectId(user_id)})
        if user is None:
            raise credentials_exception
            
        token_data = {
            "sub": str(user["_id"]),
            "email": user["email"],
            "role": user["role"],
            "created_at": str(user.get("created_at", "")),
            "updated_at": str(user.get("updated_at", "")),
        }
        
        access_token_expires = timedelta(minutes=int(ACCESS_TOKEN_EXPIRE_MINUTES))
        access_token = create_access_token(
            data=token_data, expires_delta=access_token_expires
        )
        
        return Token(
            access_token=access_token,
            refresh_token=token_data.refresh_token,
            token_type="bearer",
        )
        
    except JWTError:
        raise credentials_exception


@router.get("/me", response_model=Account)
async def get_me(current_user: Account = Depends(get_current_active_user)):
    return current_user