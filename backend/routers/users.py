from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from schemas import user
from services import user_service
from core import database

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

@router.post("/login", response_model=user.UserDetail)
async def get_user(request: user.LoginRequest, session: AsyncSession = Depends(database.get_db_session)):
    user =  await user_service.get_user_detail(session, request.username, request.password)

    if user is None:
        raise HTTPException(status_code=404, detail="not valid user")

    return user

@router.post("", response_model=user.UserDetail)
async def add_user(request: user.UserCreate, session: AsyncSession = Depends(database.get_db_session)):
    created_user = await user_service.create_user(session, request.username, request.password, request.language, request.profile_settings)
    
    if created_user is None:
        raise HTTPException(status_code=409, detail="username taken")

    return created_user

#TODO: update in the future for changing password
@router.patch("/update", response_model=user.UserDetail)
async def update_user(request: user.UserUpdate, session: AsyncSession = Depends(database.get_db_session)):
    user = await user_service.update_user(session, request.username, request.password, request.new_username, request.new_password ,request.language, request.profile_settings)

    if user is None:
        raise HTTPException(status_code=404, detail="not valid user")
    
    #TODO: make a exception class for this
    if user == "username_taken":
        raise HTTPException(status_code=409, detail="username taken")

    return user

@router.delete("")
async def delete_user(request: user.LoginRequest, session: AsyncSession = Depends(database.get_db_session)):
    boolean = await user_service.delete_user(session, request.username, request.password)
    return {
        "deleted": boolean
    }