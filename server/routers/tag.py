from fastapi import APIRouter, Depends, HTTPException, status
from utils.auth import get_current_active_user
from models.account import Account
from models.tag import Tag, TagCreate, TagUpdate
from configs.database import db
from typing import List
from utils.database import insert_and_return, update_and_return
from bson.objectid import ObjectId

router = APIRouter(prefix="/tags", tags=["Tags"], dependencies=[Depends(get_current_active_user)])

@router.get("/", response_model=List[Tag])
async def get_all_tags():
    return await db.tags.find().to_list(100)

@router.get("/user/{account_id}", response_model=List[Tag])
async def get_user_tags(account_id: str):
    try:
        return await db.tags.find({"account_id": account_id}).to_list(100)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/me", response_model=List[Tag])
async def get_current_user_tags(current_user: Account = Depends(get_current_active_user)):
    try:
        return await db.tags.find({"account_id": str(current_user.id)}).to_list(100)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/", response_model=Tag, status_code=status.HTTP_201_CREATED)
async def create_tag(
    tag: TagCreate,
    current_user: Account = Depends(get_current_active_user)
):
    tag_dict = tag.model_dump(by_alias=True)
    tag_dict["account_id"] = str(current_user.id)

    # Trim whitespace from name
    tag_dict["name"] = tag_dict["name"].strip()

    # Check if the tag name is empty
    if not tag_dict["name"]:
        raise HTTPException(status_code=400, detail="Tag name cannot be empty")

    return await insert_and_return(db.tags, tag_dict, Tag)

@router.put("/{tag_id}", response_model=Tag)
async def update_tag(
    tag_id: str,
    tag: TagUpdate,
    current_user: Account = Depends(get_current_active_user)
):
    tag_dict = tag.model_dump(by_alias=True)
    tag_dict["account_id"] = str(current_user.id)
    tag_dict["_id"] = ObjectId(tag_id)

    # Trim whitespace from name
    tag_dict["name"] = tag_dict["name"].strip()

    # Check if the tag name is empty
    if not tag_dict["name"]:
        raise HTTPException(status_code=400, detail="Tag name cannot be empty")

    return await update_and_return(db.tags, tag_dict, Tag)
    
@router.delete("/{tag_id}", response_model=Tag)
async def delete_tag(
    tag_id: str,
    current_user: Account = Depends(get_current_active_user)
):
    tag_dict = {"_id": ObjectId(tag_id), "account_id": str(current_user.id)}
    tag_dict["deleted"] = True
    return await update_and_return(db.tags, tag_dict, Tag)