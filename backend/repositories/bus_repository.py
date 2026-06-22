from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.bus_stop_schedule import BusStopSchedule
from models.bus_stops import Bus_Stop
from models.buses import Bus

async def get_bus_detail(session, bus_number):
    statement = select(Bus).where(Bus.bus_number == bus_number).options(selectinload(Bus.bus_stop_links).selectinload(BusStopSchedule.bus_stop))

    result = await session.execute(statement)
    bus = result.scalar_one_or_none()
    return bus

async def get_bus_stop_by_id(session, bus_stop_id):
    statement = select(Bus_Stop).where(Bus_Stop.bus_stop_id == bus_stop_id).options(selectinload(Bus_Stop.bus_links).selectinload(BusStopSchedule.bus), selectinload(Bus_Stop.map_node))

    result = await session.execute(statement)
    bus_stop = result.scalar_one_or_none()
    return bus_stop

async def get_bus_stop_by_name(session, bus_stop_name):
    statement = select(Bus_Stop).where(Bus_Stop.name == bus_stop_name).options(selectinload(Bus_Stop.bus_links).selectinload(BusStopSchedule.bus), selectinload(Bus_Stop.map_node))

    result = await session.execute(statement)
    bus_stop = result.scalar_one_or_none()
    return bus_stop

async def get_all_bus_stops(session):
    statement = select(Bus_Stop).where(Bus_Stop.node_id.isnot(None)).options(selectinload(Bus_Stop.bus_links).selectinload(BusStopSchedule.bus), selectinload(Bus_Stop.map_node))

    result = await session.execute(statement)
    bus_stops = result.scalars().all()
    return list(bus_stops)

