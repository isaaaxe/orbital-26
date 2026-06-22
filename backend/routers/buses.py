from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from schemas.bus import BusResponse, BusStopResponse
from services import bus_service
from core import database

router=APIRouter(
    prefix="/bus-service",
    tags=["bus_service"]
)

@router.get("/bus", response_model=BusResponse)
async def get_bus_detail(bus_number: str, session: AsyncSession = Depends(database.get_db_session)):
    bus = await bus_service.get_bus_detail(session, bus_number)

    if bus is None:
        raise HTTPException(status_code=404, detail="Invalid bus number")
    
    return bus

#if u want i can include get all bus 
#original plan was, user clicks on bus stop => it will show available buses this all they need
#unless u want a feature where user clicks a buses tab, it will show all buses available 
    
@router.get("/bus_stop/id/{bus_stop_id}", response_model=BusStopResponse)
async def get_bus_stop_by_id(bus_stop_id: str, session: AsyncSession = Depends(database.get_db_session)):
    bus_stop = await bus_service.get_bus_stop_by_id(session, bus_stop_id)

    if bus_stop is None:
        raise HTTPException(status_code=404, detail="Invalid bus stop id")
    return bus_stop

@router.get("/bus_stop/name/{bus_stop_name}", response_model=BusStopResponse)
async def get_bus_stop_by_name(bus_stop_name: str, session: AsyncSession = Depends(database.get_db_session)):
    bus_stop = await bus_service.get_bus_stop_by_name(session, bus_stop_name)

    if bus_stop is None:
        raise HTTPException(status_code=404, detail="Invalid bus stop name")
    return bus_stop

@router.get("/bus_stop/all", response_model=list[BusStopResponse])
async def get_all_bus_stops(session: AsyncSession = Depends(database.get_db_session)):
    return await bus_service.get_all_bus_stops(session)