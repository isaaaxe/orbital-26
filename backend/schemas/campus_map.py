from pydantic import BaseModel


class NodeDetail(BaseModel):
    node_id: str #can be passed into locations
    name: str 
    node_type: str
    building_id: str | None = None 
    floor: int
    latitude: float
    longitude: float

class NearestNode(BaseModel):
    nearest_node: NodeDetail
    distance_to_nearest_node: float

class EdgeDetail(BaseModel):
    edge_id: str
    from_node_id: str
    to_node_id: str
    mode: str
    distance_m: float
    estimated_seconds: float
    instruction: str | None = None
    geometry: list[tuple[float, float]] = []

class NodeEdges(BaseModel):
    node_id: str
    edge_list: list[EdgeDetail] = []

class SpecificEdge(BaseModel):
    edge: EdgeDetail


class BuildingDetail(BaseModel):
    name: str
    display_name: str
    building_id: str
    building_code: str | None = None
    aliases: list[str] = [] #may not be necessary
    area_name: str | None = None

    available_floors: list[int]

class FloorDetail(BaseModel):
    floor_id: int
    building_id: str
    floor_name: str
    floor_number: int

    geo_reference: list[list[float]]
    
    image_url: str 
    image_width: int
    image_height: int

