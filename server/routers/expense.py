from fastapi import APIRouter, Depends, status
from utils.auth import get_current_active_user
from models.account import Account
from datetime import datetime, timedelta
from typing import List, Optional
from bson.objectid import ObjectId
from fastapi import HTTPException
from pydantic import BaseModel

from models.expense import Expense, ExpenseCreate, ExpenseResponse, ExpenseUpdate
from configs.database import db
from utils.database import insert_and_return, update_and_return, delete_and_return

router = APIRouter(prefix="/expenses", tags=["Expenses"], dependencies=[Depends(get_current_active_user)])

@router.get("/", response_model=List[ExpenseResponse])
async def get_all_expenses(
    skip: int = 0,
    limit: int = 10
):
    cursor = db.expenses.find({"deleted": False}).skip(skip).limit(limit)
    expenses = await cursor.to_list(limit)
    
    # Include tag details in each expense
    for expense in expenses:
        tag = await db.tags.find_one({"_id": ObjectId(expense["tagId"])})
        expense["tag"] = tag
        del expense["tagId"]
    
    return expenses

@router.post("/", response_model=Expense, status_code=status.HTTP_201_CREATED)
async def create_expense(
    expense: ExpenseCreate,
    current_user: Account = Depends(get_current_active_user)
):
    expense_dict = expense.model_dump(by_alias=True)
    expense_dict["account_id"] = str(current_user.id)

    # Trim whitespace from description
    expense_dict["desc"] = expense_dict["desc"].strip()

    # Check if the account_id is a valid ObjectId
    if not ObjectId.is_valid(expense_dict["account_id"]):
        raise HTTPException(status_code=400, detail="Invalid account_id format")
    
    # Check account exists
    account = await db.accounts.find_one({"_id": ObjectId(expense_dict["account_id"])})
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # If tagId is provided, validate it exists
    if expense_dict.get("tagId"):
        tag = await db.tags.find_one({"_id": ObjectId(expense_dict["tagId"])})
        if not tag:
            raise HTTPException(status_code=404, detail="Tag not found")
        
        # Include tag details in the response
        created_expense = await insert_and_return(db.expenses, expense_dict, Expense)
        created_expense_dict = created_expense.dict(by_alias=True)
        return created_expense_dict
    
    return await insert_and_return(db.expenses, expense_dict, Expense)

@router.put("/{expense_id}", response_model=Expense)
async def update_expense(
    expense_id: str,
    expense: ExpenseUpdate,
    current_user: Account = Depends(get_current_active_user)
):
    expense_dict = expense.model_dump(by_alias=True)
    expense_dict["account_id"] = str(current_user.id)
    expense_dict["_id"] = ObjectId(expense_id)

    # Trim whitespace from description
    expense_dict["desc"] = expense_dict["desc"].strip()

    # Check if the account_id is a valid ObjectId
    if not ObjectId.is_valid(expense_dict["account_id"]):
        raise HTTPException(status_code=400, detail="Invalid account_id format")
    
    # Check account exists
    account = await db.accounts.find_one({"_id": ObjectId(expense_dict["account_id"])})
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    return await update_and_return(db.expenses, expense_dict, Expense)

@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense(
    expense_id: str,
    current_user: Account = Depends(get_current_active_user)
):
    expense_dict = {"_id": ObjectId(expense_id), "account_id": str(current_user.id)}
    await db.expenses.delete_one(expense_dict)
    return


@router.get("/user/{account_id}", response_model=List[ExpenseResponse])
async def get_expenses_by_account_id(
    account_id: str,
    skip: int = 0, 
    limit: int = 100,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    tag_id: Optional[str] = None
):
    query = {
        "account_id": account_id,
        "deleted": False
    }
    
    # Add date range filter if provided
    if start_date or end_date:
        date_filter = {}
        if start_date:
            date_filter["$gte"] = start_date
        if end_date:
            date_filter["$lte"] = end_date
        query["expense_date"] = date_filter
    
    # Add tag_id filter if provided
    if tag_id:
        if not ObjectId.is_valid(tag_id):
            raise HTTPException(status_code=400, detail="Invalid tag_id format")
        query["tagId"] = tag_id
    
    # Find expenses with optional filters
    cursor = db.expenses.find(query).sort("expense_date", -1).skip(skip).limit(limit)
    expenses = await cursor.to_list(limit)

    for expense in expenses:
        tag = await db.tags.find_one({"_id": ObjectId(expense["tagId"])})
        expense["tag"] = tag
        del expense["tagId"]
    
    return expenses

@router.get("/me", response_model=List[ExpenseResponse])
async def get_current_user_expenses(current_user: Account = Depends(get_current_active_user)):
    return await get_expenses_by_account_id(account_id=str(current_user.id))

@router.get("/user/{account_id}/current-month", response_model=List[ExpenseResponse])
async def get_current_month_expenses(
    account_id: str,
    skip: int = 0, 
    limit: int = 100
):
    now = datetime.now()
    first_day = datetime(now.year, now.month, 1)
    last_day = (first_day.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)
    
    return await get_expenses_by_account_id(
        account_id=account_id,
        skip=skip,
        limit=limit,
        start_date=first_day,
        end_date=last_day
    )

@router.get("/me/current-month", response_model=List[ExpenseResponse])
async def get_current_user_month_expenses(current_user: Account = Depends(get_current_active_user)):
    return await get_current_month_expenses(account_id=str(current_user.id))


@router.get("/user/{account_id}/current-year", response_model=List[ExpenseResponse])
async def get_current_year_expenses(
    account_id: str,
    skip: int = 0, 
    limit: int = 100
):
    now = datetime.now()
    first_day = datetime(now.year, 1, 1)
    last_day = datetime(now.year, 12, 31)
    
    return await get_expenses_by_account_id(
        account_id=account_id,
        skip=skip,
        limit=limit,
        start_date=first_day,
        end_date=last_day
    )

@router.get("/me/current-year", response_model=List[ExpenseResponse])
async def get_current_user_year_expenses(current_user: Account = Depends(get_current_active_user)):
    return await get_current_year_expenses(account_id=str(current_user.id))

@router.get("/user/{account_id}/by-tag/{tag_id}", response_model=List[ExpenseResponse])
async def get_expenses_by_tag(
    account_id: str,
    tag_id: str,
    skip: int = 0, 
    limit: int = 100
):
    if not ObjectId.is_valid(tag_id):
        raise HTTPException(status_code=400, detail="Invalid tag_id format")
    
    # First, get the tag to include its details in the response
    tag = await db.tags.find_one({"_id": ObjectId(tag_id)})
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    query = {
        "account_id": account_id,
        "tagId": tag_id,
        "deleted": False
    }
    
    # Find expenses with this tag
    cursor = db.expenses.find(query).sort("expense_date", -1).skip(skip).limit(limit)
    expenses = await cursor.to_list(limit)
    
    # Include tag details in each expense
    for expense in expenses:
        expense["tag"] = tag
    
    return expenses

@router.get("/me/by-tag/{tag_id}", response_model=List[ExpenseResponse])
async def get_current_user_expenses_by_tag(
    tag_id: str,
    skip: int = 0, 
    limit: int = 100,
    current_user: Account = Depends(get_current_active_user)
):
    return await get_expenses_by_tag(account_id=str(current_user.id), tag_id=tag_id, skip=skip, limit=limit)


class MonthlySummary(BaseModel):
    month: int
    year: int
    total: float
    count: int


@router.get("/user/{account_id}/monthly-summary", response_model=List[MonthlySummary])
async def get_monthly_summary(
    account_id: str,
    year: Optional[int] = None,
):
    """
    Get monthly expense summary for an account, optionally filtered by year.
    """
    pipeline = [
        {
            "$match": {
                "account_id": account_id,
                "deleted": False
            }
        },
        {
            "$project": {
                "year": {"$year": "$expense_date"},
                "month": {"$month": "$expense_date"},
                "amount": 1
            }
        }
    ]
    
    # Add year filter if provided
    if year is not None:
        pipeline[0]["$match"]["expense_date"] = {
            "$gte": datetime(year, 1, 1),
            "$lt": datetime(year + 1, 1, 1)
        }
    
    # Add grouping and sorting
    pipeline.extend([
        {
            "$group": {
                "_id": {"year": "$year", "month": "$month"},
                "total": {"$sum": "$amount"},
                "count": {"$sum": 1}
            }
        },
        {
            "$project": {
                "_id": 0,
                "year": "$_id.year",
                "month": "$_id.month",
                "total": 1,
                "count": 1
            }
        },
        {"$sort": {"year": 1, "month": 1}}
    ])
    
    result = await db.expenses.aggregate(pipeline).to_list(None)
    return result

@router.get("/me/monthly-summary", response_model=List[MonthlySummary])
async def get_current_user_monthly_summary(current_user: Account = Depends(get_current_active_user)):
    return await get_monthly_summary(account_id=str(current_user.id))
