from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from schemas import campus_map
from services import campus_map_service
from core import database

router=APIRouter(
    prefix="/campus-map",
    tags=["campus_map"]
)

#pass the x,y,z raw coord
@router.get("/nodes/nearest", response_model=campus_map.NearestNode)
async def search_nearest_node(latitude :float, longitude: float, floor: int, session: AsyncSession = Depends(database.get_db_session)):
    nearest_node = await campus_map_service.search_nearest_node(session, latitude, longitude, floor)

    if nearest_node is None:
        raise HTTPException(status_code=404, detail="Where are u even")
    return nearest_node


@router.get("/nodes/{node_id}", response_model=campus_map.NodeDetail)
async def get_node(node_id: str, session: AsyncSession = Depends(database.get_db_session)):
    node = await campus_map_service.get_node(session, node_id)

    if node is None:
        raise HTTPException(status_code=404, detail="Not valid node id")
    return node

#not needed now
@router.get("/nodes/{node_id}/edges", response_model=list[campus_map.NodeEdges])
async def get_node_edges(node_id: str, session: AsyncSession = Depends(database.get_db_session)):
    return []

#pass the 2 node_id from all node edges, not needed now
@router.get("/edges", response_model=campus_map.SpecificEdge)
async def get_edge_between_nodes(start: int, end: int, session: AsyncSession = Depends(database.get_db_session)):
    return {}

#we are searching by location so see how
@router.get("/buildings",  response_model=list[campus_map.BuildingDetail])
async def search_buildings(building_name: str, session: AsyncSession = Depends(database.get_db_session)):
    return await campus_map_service.search_buildings_by_name(session, building_name)

@router.get("/buildings/all", response_model=list[campus_map.BuildingDetail])
async def get_all_buildings(session: AsyncSession = Depends(database.get_db_session)):
    return await campus_map_service.get_all_buildings(session)

@router.get("/buildings/{building_id}", response_model=campus_map.BuildingDetail)
async def get_building(building_id: str, session: AsyncSession = Depends(database.get_db_session)):
    building = await campus_map_service.get_building_detail(session, building_id)
    if building is None:
        raise HTTPException(status_code=404, detail="building not found")
    
    return building

@router.get("/buildings/{building_id}/floors", response_model=list[campus_map.FloorDetail])
async def get_floors(building_id: str, session: AsyncSession = Depends(database.get_db_session)):
    result = await campus_map_service.get_building_floors(session, building_id)
    if result is None:
        raise HTTPException(status_code=404, detail="building not found")

    return result

@router.get("/buildings/{building_id}/floors/{floor_number}", response_model=campus_map.FloorDetail)
async def get_floor(building_id: str, floor_number: int, session: AsyncSession = Depends(database.get_db_session)):
    floor = await campus_map_service.get_building_floor_by_number(session, building_id, floor_number)
    if floor is None:
        raise HTTPException(status_code=404, detail="building does not have this floor number")
    
    return floor