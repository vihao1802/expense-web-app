from pydantic import BaseModel, Field
from typing import Optional
from models.common import PyObjectId
from datetime import datetime

class TagBase(BaseModel):
    name: str
    account_id: PyObjectId
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    deleted: bool = Field(default=False)

class Tag(TagBase):
    id: Optional[PyObjectId] = Field(alias="_id",default=None)
    color: Optional[str] = Field(default=None)

class TagCreate(BaseModel):
    name: str = Field(..., max_length=255)
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_schema_extra = {
            "example": {
                "name": "Ăn sáng",
                "account_id" : "string",
            }
        }

class TagUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_schema_extra = {
            "example": {
                "name": "Ăn sáng",
                "color": "#FF0000"
            }
        }