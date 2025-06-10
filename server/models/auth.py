from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from models.common import PyObjectId
from datetime import datetime


class Auth(BaseModel):
    email: EmailStr = Field(...)
    password: str = Field(...)

    class Config:
        json_schema_extra = {
            "example": {
                "email": "example@gmail.com",
                "password": "123456",
            }
        }

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TokenRefresh(BaseModel):
    refresh_token: str