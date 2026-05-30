from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from schemas import user
from services import user_service
from core import database

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

@router.get("/{user_id}", response_model=user.UserDetail)
async def get_user(user_id: str, session: AsyncSession = Depends(database.get_db_session)):
    user =  await user_service.get_user_detail(session, user_id)

    if user is None:
        raise HTTPException(status_code=404, detail="not valid user")

    return user

@router.post("", response_model=user.UserDetail)
async def add_user(request: user.UserCreate, session: AsyncSession = Depends(database.get_db_session)):
    user = await user_service.create_user(session, request.username, request.language, request.profile_settings)
    return user

@router.patch("/{user_id}", response_model=user.UserDetail)
async def update_user(user_id: str, request: user.UserUpdate, session: AsyncSession = Depends(database.get_db_session)):
    user = await user_service.update_user(session, user_id, request.username, request.language, request.profile_settings)

    if user is None:
        raise HTTPException(status_code=404, detail="not valid user")

    return user

@router.delete("/{user_id}")
async def delete_user(user_id: str, session: AsyncSession = Depends(database.get_db_session)):
    boolean = await user_service.delete_user(session, user_id)
    return {
        "delted": boolean
    }