from pydantic import BaseModel


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