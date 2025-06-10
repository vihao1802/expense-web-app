from pydantic import BaseModel, Field
from typing import Optional
from models.common import PyObjectId
from datetime import datetime
from models.tag import Tag

class ExpenseBase(BaseModel):
    amount: float = Field(..., gt=1000, description="Amount must be greater than 1000")
    desc: Optional[str] = Field(default="", max_length=255)
    deleted: bool = Field(default=False)
    expense_date: datetime = Field(..., description="Expense date is required")

class Expense(ExpenseBase):
    account_id: PyObjectId 
    tagId: Optional[str] = Field(default=None)
    id: Optional[PyObjectId] = Field(alias="_id",default=None)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class ExpenseResponse(ExpenseBase):
    id: Optional[PyObjectId] = Field(alias="_id",default=None)
    tag: Optional[Tag] = None

class ExpenseCreate(ExpenseBase):
    tagId: Optional[str] = Field(default=None) 
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_schema_extra = {
            "example": {
                "amount": 100000,
                "tagId": None,
                "desc": "Ăn sáng",
                "account_id": "string"
            }
        }

class ExpenseUpdate(ExpenseBase):
    tagId: Optional[str] = Field(default=None) 
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_schema_extra = {
            "example": {
                "amount": 100000,
                "tagId": None,
                "desc": "Ăn sáng",
                "account_id": "string"
            }
        }