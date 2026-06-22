from repositories import bus_repository
from schemas.bus import BusResponse, BusStopResponse
from models.buses import Bus
from models.bus_stops import Bus_Stop

async def get_bus_detail(session, bus_number):
    bus: Bus = await bus_repository.get_bus_detail(session, bus_number)

    if bus is None:
        return None
    
    stop_names = []
    for bus_stop in bus.bus_stops:
        bus_stop: Bus_Stop
        stop_names.append(bus_stop.name)

    return BusResponse(
        bus_number=bus.bus_number,
        bus_stops=stop_names,
    )

async def get_bus_stop_by_id(session, bus_stop_id):
    bus_stop: Bus_Stop = await bus_repository.get_bus_stop_by_id(session, bus_stop_id)

    if bus_stop is None or bus_stop.map_node is None:
        return None
    
    available_buses = []
    for bus in bus_stop.buses:
        bus: Bus
        available_buses.append(bus.bus_number)

    bus_schedules = dict()
    for link in bus_stop.bus_links:
        bus_schedules[link.bus.bus_number] = link.schedule

    
    return BusStopResponse(
        bus_stop_id=bus_stop.bus_stop_id,
        name=bus_stop.name,
        node_id=bus_stop.node_id,
        latitude=bus_stop.map_node.latitude,
        longitude=bus_stop.map_node.longitude,
        available_buses=available_buses,
        bus_schedules=bus_schedules
    )

async def get_bus_stop_by_name(session, bus_stop_name):
    bus_stop: Bus_Stop = await bus_repository.get_bus_stop_by_name(session, bus_stop_name)

    if bus_stop is None or bus_stop.map_node is None:
        return None
    
    available_buses = []
    for bus in bus_stop.buses:
        bus: Bus
        available_buses.append(bus.bus_number)

    bus_schedules = dict()
    for link in bus_stop.bus_links:
        bus_schedules[link.bus.bus_number] = link.schedule

    
    return BusStopResponse(
        bus_stop_id=bus_stop.bus_stop_id,
        name=bus_stop.name,
        node_id=bus_stop.node_id,
        latitude=bus_stop.map_node.latitude,
        longitude=bus_stop.map_node.longitude,
        available_buses=available_buses,
        bus_schedules=bus_schedules
    )

async def get_all_bus_stops(session):
    bus_stops: list[Bus_Stop] = await bus_repository.get_all_bus_stops(session)

    response = []
    for bus_stop in bus_stops:
        available_buses = []
        for bus in bus_stop.buses:
            bus: Bus
            available_buses.append(bus.bus_number)

        bus_schedules = dict()
        for link in bus_stop.bus_links:
            bus_schedules[link.bus.bus_number] = link.schedule

        
        response.append(BusStopResponse(
            bus_stop_id=bus_stop.bus_stop_id,
            name=bus_stop.name,
            node_id=bus_stop.node_id,
            latitude=bus_stop.map_node.latitude,
            longitude=bus_stop.map_node.longitude,
            available_buses=available_buses,
            bus_schedules=bus_schedules
        ))
    
    return response