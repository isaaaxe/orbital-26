from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone

from models.recent_locations import Recent_Location
from models.locations import Location

async def get_recent_locations(session, user_id):
    statement = (
        select(Recent_Location, Location)
        .join(Location, Recent_Location.location_id == Location.id)
        .where(Recent_Location.user_id == user_id)
        .order_by(Recent_Location.time.desc()).limit(5)
    )

    result = await session.execute(statement)
    return result.all()

async def update_recent_location(session, user_id, location_id):
    statement = select(Location).where(Location.id == location_id)

    result = await session.execute(statement)
    location : Location = result.scalar_one_or_none()

    #not valid location
    if location is None:
        return None

    existing_statement = select(Recent_Location).where(Recent_Location.location_id == location_id, Recent_Location.user_id == user_id)
    existing_result = await session.execute(existing_statement)
    existing_recent = existing_result.scalar_one_or_none()

    if existing_recent is not None:
        existing_recent: Recent_Location
        existing_recent.time = datetime.now(timezone.utc)
        await session.commit()
        await session.refresh(existing_recent)
        return existing_recent
    
    
    new_recent = Recent_Location(
        user_id=user_id,
        location_id=location_id,
    )

    session.add(new_recent)
    await session.commit()
    await session.refresh(new_recent)
    return new_recent


async def delete_recent_location(session, user_id, location_id):
    statement = select(Recent_Location).where(
            Recent_Location.location_id == location_id,
            Recent_Location.user_id == user_id,
        )

    result = await session.execute(statement)
    recent_location = result.scalar_one_or_none()

    if recent_location is None:
        return False

    await session.delete(recent_location)
    await session.commit()

    return True

async def delete_all_recent_locations(session, user_id):
    statement = select(Recent_Location).where(
            Recent_Location.user_id == user_id,
        )

    result = await session.execute(statement)
    recent_locations = result.scalars().all()

    if not recent_locations:
        return False

    for recent_location in recent_locations:
        await session.delete(recent_location)
        
    await session.commit()
    return True

