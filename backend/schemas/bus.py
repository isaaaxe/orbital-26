from pydantic import BaseModel

class BusStopResponse(BaseModel):
    bus_stop_id: str
    name: str
    node_id: str | None = None
    latitude: float
    longitude: float

    available_buses: list[str] = []
    bus_schedules: dict[str, int] = {}


class BusResponse(BaseModel):
    bus_number: str
    bus_stops: list[str]
