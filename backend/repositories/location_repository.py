from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.locations import Location

async def get_location_by_name(session, location_name) -> list[Location]:
    statement = select(Location).where(Location.name.ilike(f"%{location_name}%"))

    result = await session.execute(statement)
    locations = result.scalars().all()
    return list(locations)

async def get_location_by_id(session, location_id):
    statement = select(Location).where(Location.id == location_id)

    result = await session.execute(statement)
    location = result.scalar_one_or_none()
    return location

