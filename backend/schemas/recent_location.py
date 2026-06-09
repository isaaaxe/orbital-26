from pydantic import BaseModel
from datetime import datetime, timezone

class AddRecentLocationRequest(BaseModel):
    location_id: str

class RecentLocationResponse(BaseModel):
    recent_id: int
    location_id: str
    name: str
    time: datetime
    description: str = ""
    display_name: str
    location_type: str #whether its a lt, seminar room, class room etc
    building_code: str | None = None
    area_name: str | None = None