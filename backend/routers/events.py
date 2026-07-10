from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from schemas.event import EventResponse
from services import event_service
from core import database

router=APIRouter(
    prefix="/events",
    tags=["events"]
)

@router.get("", response_model=list[EventResponse])
async def get_upcoming_events(date_range: int | None = Query(None, ge=1, le=365), session: AsyncSession = Depends(database.get_db_session)):
    return await event_service.get_upcoming_events(session, date_range)
