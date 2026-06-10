from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.saved_locations import Saved_Location
from models.locations import Location

async def get_user_saves(session, user_id):
    statement = select(Saved_Location, Location).join(Location, Saved_Location.location_id == Location.id).where(Saved_Location.user_id == user_id)

    result = await session.execute(statement)
    return result.all()

async def add_user_save(session, user_id, location_id, purpose):
    statement = select(Location).where(Location.id == location_id)

    result = await session.execute(statement)
    location : Location = result.scalar_one_or_none()

    if location is None:
        return None
    
    existing_statement = select(Saved_Location).where(Saved_Location.location_id == location_id, Saved_Location.user_id == user_id)
    existing_result = await session.execute(existing_statement)
    existing_save = existing_result.scalar_one_or_none()

    if existing_save is not None:
        return existing_save

    new_save = Saved_Location(
        user_id=user_id,
        location_id=location.id,
        purpose=purpose or "",
    )
    
    session.add(new_save)
    await session.commit()
    await session.refresh(new_save)

    return new_save

async def delete_user_save(session, user_id, location_id):
    statement = select(Saved_Location).where(
            Saved_Location.location_id == location_id,
            Saved_Location.user_id == user_id,
        )

    result = await session.execute(statement)
    saved_location = result.scalar_one_or_none()
    if saved_location is None:
        return False
    
    await session.delete(saved_location)
    await session.commit()

    return True