from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from schemas import location
from services import location_service
from core import database

router = APIRouter(
    prefix="/locations",
    tags=["locations"]
)

#for searching location id 
@router.get("/search", response_model=list[location.LocationDetail])
async def search_locations(q: str, session: AsyncSession = Depends(database.get_db_session)):
    return await location_service.search_locations_by_name(session, q)

#for exact location details
@router.get("/{location_id}", response_model=location.LocationDetail)
async def get_location(location_id: str, session: AsyncSession = Depends(database.get_db_session)):
    location =  await location_service.get_location_detail(session, location_id)
    if location is None:
        raise HTTPException(status_code=404, detail="Location not found")

    return location

@router.get("", response_model=list[location.LocationDetail])
async def get_location_by_type(location_type: str, session: AsyncSession = Depends(database.get_db_session)):
    locations = await location_service.get_location_by_type(session, location_type)
    
    return locations
