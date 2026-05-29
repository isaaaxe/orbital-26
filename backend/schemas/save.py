from pydantic import BaseModel

class AddSaveRequest(BaseModel):
    location_id: str
    purpose: str | None = None

class SaveResponse(BaseModel):
    save_id: str
    location_id: str
    name: str
    display_name: str
    location_type: str #whether its a lt, seminar room, class room etc
    building_code: str | None = None
    area_name: str | None = None

    purpose: str | None = None
