from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from schemas import save
from services import save_service
from core import database


router=APIRouter(
    prefix="/users/{user_id}/saves",
    tags=["saves"]
)

@router.get("", response_model=list[save.SaveResponse])
async def get_user_saves(user_id: str, session: AsyncSession = Depends(database.get_db_session)):
    saves = await save_service.get_user_saves(session, user_id)
    return saves

@router.post("", response_model=save.SaveResponse)
async def add_user_save(user_id: str, request: save.AddSaveRequest, session: AsyncSession = Depends(database.get_db_session)):
    save = await save_service.add_user_save(session, user_id, request.location_id, request.purpose)

    if save is None:
        raise HTTPException(status_code=404, detail="not valid location")
    return save

@router.patch("/{save_id}")
async def update_user_save(user_id: str, save_id: int, session: AsyncSession = Depends(database.get_db_session)):
    #search data base and update
    return {}

@router.delete("/{save_id}")
async def delete_user_save(user_id: str, save_id: int, session: AsyncSession = Depends(database.get_db_session)):
    #same as add search and delete
    boolean = await save_service.delete_user_save(session, user_id, save_id)
    return {
        "deleted": boolean
    }

