from pydantic import BaseModel

class RouteRequest(BaseModel):
    start_id: str
    destination_id: str
    mode: str = "walk_bus"

class RouteStep(BaseModel):
    step_number: int
    step_instruction: str
    mode: str
    distance_for_step: float
    estimated_seconds: float
    from_name: str | None = None #for corners
    to_name: str | None = None   #for corners

class RouteResponse(BaseModel):
    total_distance: float
    total_estimated_seconds: float
    steps: list[RouteStep]
    path_coordinates: list[tuple[float, float]]

