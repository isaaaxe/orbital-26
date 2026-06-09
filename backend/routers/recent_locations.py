from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from schemas import recent_location
from services import recent_service, auth_service
from core import database
from models.users import User

router = APIRouter(
    prefix="/users/me/recent_locations",
    tags=["recent_locations"]
)

@router.get("", response_model=list[recent_location.RecentLocationResponse])
async def get_recent_locations(session: AsyncSession = Depends(database.get_db_session), current_user: User = Depends(auth_service.get_current_user),):
    response =  await recent_service.get_recent_locations(session, current_user)
    
    return response

@router.post("", response_model=recent_location.RecentLocationResponse)
async def add_recent_location(request: recent_location.AddRecentLocationRequest, session: AsyncSession = Depends(database.get_db_session), current_user: User = Depends(auth_service.get_current_user),):
    response = await recent_service.update_recent_location(session, current_user, request.location_id)

    if response is None:
        raise HTTPException(status_code=404, detail="Not valid location")
    
    return response

@router.delete("/one")
async def delete_recent_location(request: recent_location.AddRecentLocationRequest, session: AsyncSession = Depends(database.get_db_session), current_user: User = Depends(auth_service.get_current_user),):
    boolean = await recent_service.delete_recent_location(session, current_user, request.location_id)

    return {
        "deleted": boolean
    }


@router.delete("/all")
async def delete_all_recent_locations(session: AsyncSession = Depends(database.get_db_session), current_user: User = Depends(auth_service.get_current_user),):
    boolean = await recent_service.delete_all_recent_locations(session, current_user)

    return {
        "deleted": boolean
    }