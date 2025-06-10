import bcrypt
from fastapi import APIRouter, Depends, HTTPException, Query, status
from utils.auth import get_current_active_user
from models.account import Account
from models.account import Account, AccountCreate
from configs.database import db
from typing import List
from utils.database import insert_and_return

router = APIRouter(prefix="/accounts", tags=["Accounts"])

@router.get("/", response_model=List[Account], dependencies=[Depends(get_current_active_user)])
async def list_accounts(
    skip: int = 0,
    limit: int = 10,
    name: str = Query(None)
):
    query = {}
    if name:
        query["name"] = {"$regex": name, "$options": "i"}
    cursor = db.accounts.find(query).skip(skip).limit(limit)
    return await cursor.to_list(length=limit)

@router.post("/", response_model=Account, status_code=status.HTTP_201_CREATED, dependencies=[Depends(get_current_active_user)])
async def create_account(account: AccountCreate):
    account_dict = account.model_dump(by_alias=True)

    # Trim whitespace from name
    account_dict["name"] = account_dict["name"].strip()

    # Check if the account name is empty
    if not account_dict["name"]:
        raise HTTPException(status_code=400, detail="Account name cannot be empty")
    
    # Check if the account already exists with the same email
    existing_account = await db.accounts.find_one({
        "email": account_dict["email"]
    })
    if existing_account:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    # Hash the password
    plain_password = account_dict.pop("password")  # remove  password from dict
    hashed_password = bcrypt.hashpw(plain_password.encode('utf-8'), bcrypt.gensalt())
    account_dict["password"] = hashed_password.decode('utf-8')  
    
    return await insert_and_return(db.accounts, account_dict, Account)
