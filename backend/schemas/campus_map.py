from pydantic import BaseModel

class NearestNode(BaseModel):
    nearest_node_id: str
    distance_to_nearest_node: float


class NodeDetail(BaseModel):
    node_id: str #can be passed into locations
    name: str 
    node_type: str
    building_id: str
    building_code: str | None = None
    floor: int
    latitude: float
    longtidue: float

class EdgeDetail(BaseModel):
    edge_id: str
    from_node_id: str
    to_node_id: str
    mode: str
    distance_m: str
    estimated_seconds: float
    instruction: str | None = None
    geometry: list[tuple[float, float]] = []

class NodeEdges(BaseModel):
    node_id: str
    edge_list: list[EdgeDetail] = []

class SpecificEdge(BaseModel):
    edge: EdgeDetail


class BuildingSearchResult(BaseModel):
    name: str
    display_name: str
    building_id: str
    building_code: str | None = None
    area_name: str | None = None
    aliases: list[str] = [] #may not be necessary

class BuildingDetail(BaseModel):
    name: str
    display_name: str
    building_id: str
    building_code: str | None = None
    aliases: list[str] = [] #may not be necessary
    area_name: str | None = None

    floor: int | None = None
    available_floors: list[int] = []

class FloorSearchResult(BaseModel):
    floor_id: str
    building_id: str
    floor_number: str
    floor_name: str
    display_name: str

class FloorDetail(BaseModel):
    floor_id: str
    building_id: str
    floor_name: str
    floor_numbere: int
    display_name: str

    room_numbers: list[str] = []
    map_image_url: str | None = None
