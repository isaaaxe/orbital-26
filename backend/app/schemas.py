from datetime import datetime
from pydantic import BaseModel, ConfigDict


class BuildingCreate(BaseModel):
    name: str
    code: str
    latitude: float | None = None
    longitude: float | None = None


class BuildingRead(BaseModel):
    id: int
    name: str
    code: str
    latitude: float | None = None
    longitude: float | None = None

    model_config = {
        "from_attributes": True
    }

class UserRead(BaseModel):
    id: int
    email: str
    nickname: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)