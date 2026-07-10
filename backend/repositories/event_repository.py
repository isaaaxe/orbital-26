from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date, timedelta

from models.events import Event

async def get_upcoming_events(session, date_range: int | None = None):
    today = date.today()
    if date_range is None:
        statement = select(Event).where(Event.end_date >= today).order_by(Event.start_date, Event.event_id)
    else:
        statement = select(Event).where(Event.start_date <= today + timedelta(days=date_range), Event.end_date >= today).order_by(Event.start_date, Event.event_id)
    result = await session.execute(statement)
    return list(result.scalars().all())

