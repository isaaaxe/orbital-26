from fastapi import APIRouter
from schemas import campus_map

router=APIRouter(
    prefix="/campus-map",
    tags=["campus_map"]
)

#pass the x,y,z raw coord
@router.get("/nodes/nearest", response_model=campus_map.NearestNode)
def search_nearest_node(x :float, y: float, floor: int):
    return {}

@router.get("/nodes/{node_id}", response_model=campus_map.NodeDetail)
def get_node(node_id: str):
    return {}

@router.get("/nodes/{node_id}/edges", response_model=list[campus_map.NodeEdges])
def get_node_edges(node_id: str):
    return []

#pass the 2 node_id from all node edges
@router.get("/edges", response_model=campus_map.SpecificEdge)
def get_edge_between_nodes(start: int, end: int):
    return {}

@router.get("/buildings",  response_model=list[campus_map.BuildingSearchResult])
def search_buildings(building_name: str):
    return []

@router.get("/buildings/{building_id}", response_model=campus_map.BuildingDetail)
def get_building(building_id: str):
    return {}

@router.get("/buildings/{building_id}/floors", response_model=list[campus_map.FloorSearchResult])
def get_floors(building_id: str):
    return []

@router.get("/buildings/{building_id}/floors/{floor_number}", response_model=campus_map.FloorDetail)
def get_floor(building_id: str, floor_number: str):
    return {}