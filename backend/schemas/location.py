from pydantic import BaseModel
from schemas.campus_map import Canteen

class LocationDetail(BaseModel):
    id: str 
    name: str
    description: str =""
    display_name: str
    aliases: list[str] = [] #may not be necessary
    location_type: str

    building_code: str | None = None
    building_name: str | None = None
    floor_id: int | None = None

    area_name: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    boundaries: dict | None = None
    #polgon: list...
    

    nearest_node_id: str | None = None
    nearest_bus_stop_id: str | None = None

    landmark_hint: str | None = None
    arrival_instruction: str | None = None

    crowd_density: dict | None = None
    opening_hours: dict | None = None
    canteen: Canteen | None = None
    

    