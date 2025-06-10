from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from models.common import PyObjectId
from datetime import datetime

class AccountBase(BaseModel):
    email: EmailStr = Field(...)
    name: str = Field(...)
    avatar: Optional[str] = Field(default=None)
    role: str = Field(default="user")
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class Account(AccountBase):
    id: Optional[PyObjectId] = Field(alias="_id",default=None)

class AccountCreate(AccountBase):
    password: str = Field(...,error_messages={"missing": "Password is required"})

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_schema_extra = {
            "example": {
                "email": "abc@gmail.com",
                "name": "Nguyễn Văn A",
                "password": "123456",
                "role": "user",
            }
        }
        


