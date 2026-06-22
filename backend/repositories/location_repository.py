from sqlalchemy import select, or_, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.locations import Location
from utils.normalise import normalise

async def get_location_by_name(session, location_name) -> list[Location]:
    key = normalise(location_name)
    statement = select(Location).where(
        or_(
            Location.name.ilike(f"%{location_name}%"),
            Location.display_name.ilike(f"%{location_name}%"),
            func.array_to_string(Location.aliases, " ").ilike(f"%{location_name}%"),
            func.array_to_string(Location.aliases, "").ilike(f"%{key}%"), 
        )
    ).options(selectinload(Location.building), selectinload(Location.canteen))

    result = await session.execute(statement)
    locations = result.scalars().all()
    return list(locations)

async def get_location_by_id(session, location_id):
    statement = select(Location).where(Location.id == location_id).options(selectinload(Location.building), selectinload(Location.canteen))

    result = await session.execute(statement)
    location = result.scalar_one_or_none()
    return location

async def get_location_by_type(session, location_type):
    statement = select(Location).where(Location.location_type==location_type).options(selectinload(Location.building), selectinload(Location.canteen))

    result = await session.execute(statement)
    locations = result.scalars().all()
    return list(locations)

