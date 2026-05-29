from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from schemas import route
from services import routing_service
from core import database

router = APIRouter(
    prefix="/routes",
    tags=["routes"]
)

#sends the start + destinatin + prefernce + constraints as request to me 
#POST => sends structured data for backend to process, create or compute
@router.post("", response_model=route.RouteResponse)
async def create_route(request: route.RouteRequest, session: AsyncSession = Depends(database.get_db_session)):
    path = await routing_service.generate_route(session, request.start_id, request.destination_id, request.mode)
    if path is None:
        raise HTTPException(status_code=404, detail="No route found")
    return path

