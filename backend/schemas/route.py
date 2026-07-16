from pydantic import BaseModel

class RouteRequest(BaseModel):
    start_id: str
    destination_id: str
    mode: list[str] = ["fastest"]

class RouteStep(BaseModel):
    step_number: int
    transport_mode: str
    distance_for_step: float
    estimated_seconds: float
    buildings_passed_by_id: list[str | None] = []
    floor_transition: list[int]
    from_name: str | None = None #for corners
    from_node_id: str 
    from_node_type: str
    to_name: str | None = None   #for corners
    to_node_id: str
    to_node_type: str
    vertical_edge: str | None = None

class RouteResponse(BaseModel):
    total_distance: float
    total_estimated_seconds: float
    mode: str
    steps: list[RouteStep]
    path_coordinates: list[tuple[float, float]]
    route_instructions: list[str]
