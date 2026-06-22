from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.buildings import Building
from models.floors import Floor
from utils import normalise

async def get_building_by_name(session, building_name):
    key = normalise(building_name)
    statement = select(Building).where(
        or_(
            Building.name.ilike(f"%{building_name}%"),
            Building.display_name.ilike(f"%{building_name}%"),
            Building.aliases.any(key),  
        )
    ).options(selectinload(Building.floors))

    result = await session.execute(statement)
    buildings = result.scalars().all()
    return list(buildings)

async def get_building_by_id(session, building_id):
    statement = select(Building).where(Building.building_id == building_id).options(selectinload(Building.floors))

    result = await session.execute(statement)
    building = result.scalar_one_or_none()
    return building

async def get_all_buildings(session):
    statement = select(Building).options(selectinload(Building.floors))
    result = await session.execute(statement)
    return list(result.scalars().all())


async def get_floors(session, building_id):
    statement = select(Floor).where(Floor.building_id == building_id).order_by(Floor.floor_number)

    result = await session.execute(statement)
    floors = result.scalars().all()
    return list(floors)

async def get_floor_by_number(session, building_id, floor_number):
    statement = select(Floor).where(
            Floor.building_id == building_id,
            Floor.floor_number == floor_number,
        )

    result = await session.execute(statement)
    floor = result.scalar_one_or_none()
    return floor
