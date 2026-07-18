from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from schemas import route
from services import routing_service
from services.auth_service import get_optional_user
from models.users import User
from algorithms.graph_builder import GraphCache
from core import database

router = APIRouter(
    prefix="/routes",
    tags=["routes"]
)

#sends the start + destinatin + prefernce + constraints as request to me 
#POST => sends structured data for backend to process, create or compute
@router.post("", response_model=list[route.RouteResponse])
async def create_route(app_request: Request, route_request: route.RouteRequest, session: AsyncSession = Depends(database.get_db_session), current_user: User | None = Depends(get_optional_user)):
    graph: GraphCache = app_request.app.state.graph
    options = []
    for mode in route_request.mode:
        path = await routing_service.generate_route(session, route_request.start_id, route_request.destination_id, mode, current_user, graph)
        if path is not None:
            options.append(path)

    if not options:
        raise HTTPException(status_code=404, detail="No route found")
    
    return options

