from pydantic import BaseModel

class LocationSearchResult(BaseModel):
    id: str
    name: str
    display_name: str
    location_type: str #whether its a lt, seminar room, class room etc
    building_code: str | None = None
    area_name: str | None = None

class LocationDetail(BaseModel):
    id: str 
    name: str
    display_name: str
    aliases: list[str] = [] #may not be necessary
    location_type: str

    building_code: str | None = None
    building_name: str | None = None
    floor: int | None = None
    available_floors: list[int] = []

    area_name: str | None = None
    latitude: float | None = None
    longitude: float | None = None

    nearest_node_id: str | None = None
    nearest_bus_stop_id: str | None = None

    landmark_hint: str | None = None
    arrival_instruction: str | None
    

    