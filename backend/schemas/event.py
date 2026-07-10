from pydantic import BaseModel
from datetime import date

class EventResponse(BaseModel):
    event_id: str
    name: str

    start_date: date
    end_date: date

    description: str
    categories: list[str] = []
    audiences: list[str] = []

    image_url: str | None = None
    event_url: str

