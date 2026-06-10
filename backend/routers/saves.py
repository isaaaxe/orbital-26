from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from schemas import save
from services import save_service, auth_service
from core import database
from models.users import User


router=APIRouter(
    prefix="/users/me/saves",
    tags=["saves"]
)

@router.get("", response_model=list[save.SaveResponse])
async def get_user_saves(session: AsyncSession = Depends(database.get_db_session), current_user: User = Depends(auth_service.get_current_user),):
    saves = await save_service.get_user_saves(session, current_user)
    return saves

@router.post("", response_model=save.SaveResponse)
async def add_user_save(request: save.AddSaveRequest, session: AsyncSession = Depends(database.get_db_session), current_user: User = Depends(auth_service.get_current_user),):
    save = await save_service.add_user_save(session, current_user, request.location_id, request.purpose)

    if save is None:
        raise HTTPException(status_code=404, detail="not valid location")
    return save

@router.patch("/{location_id}")
async def update_user_save(location_id: str, session: AsyncSession = Depends(database.get_db_session), current_user: User = Depends(auth_service.get_current_user),):
    #search data base and update
    return {}

@router.delete("/{location_id}")
async def delete_user_save(location_id: str, session: AsyncSession = Depends(database.get_db_session), current_user: User = Depends(auth_service.get_current_user),):
    #same as add search and delete
    boolean = await save_service.delete_user_save(session, current_user, location_id)
    return {
        "deleted": boolean
    }

