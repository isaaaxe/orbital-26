from repositories import location_repository
from schemas.location import LocationDetail
from models.canteens import Canteen
from models.locations import Location

async def search_locations_by_name(session, q: str):
    location_list = await location_repository.get_location_by_name(session, q)
    search_result_list =[]

    for location in location_list:
        search_result = LocationDetail(
            id=location.id,
            name=location.name,
            description=location.description,
            display_name=location.display_name,
            aliases=location.aliases,
            location_type=location.location_type,
            building_id=location.building.building_id if location.building else None,
            building_code=location.building.building_code if location.building else None,
            building_name=location.building.display_name if location.building else None,
            floor_id=location.floor_id,
            area_name=location.area_name,
            latitude=location.latitude,
            longitude=location.longitude,
            boundaries=location.boundaries,
            nearest_node_id=location.nearest_node_id,
            nearest_bus_stop_id=location.nearest_bus_stop_id,
            landmark_hint=location.landmark_hint,
            arrival_instruction=location.arrival_instruction,
            crowd_density=location.crowd_density,
            opening_hours=location.opening_hours,
            canteen=location.canteen,
        )
        search_result_list.append(search_result)
    
    return search_result_list

async def get_location_detail(session, location_id):
    location = await location_repository.get_location_by_id(session, location_id)
    if location is None:
        return None
    
    return LocationDetail(
        id=location.id,
        name=location.name,
        description=location.description,
        display_name=location.display_name,
        aliases=location.aliases,
        location_type=location.location_type,
        building_id=location.building.building_id if location.building else None,
        building_code=location.building.building_code if location.building else None,
        building_name=location.building.display_name if location.building else None,
        floor_id=location.floor_id,
        area_name=location.area_name,
        latitude=location.latitude,
        longitude=location.longitude,
        boundaries=location.boundaries,
        nearest_node_id=location.nearest_node_id,
        nearest_bus_stop_id=location.nearest_bus_stop_id,
        landmark_hint=location.landmark_hint,
        arrival_instruction=location.arrival_instruction,
        crowd_density=location.crowd_density,
        opening_hours=location.opening_hours,
        canteen=location.canteen,
    )

async def get_location_by_type(session, location_type):
    locations = await location_repository.get_location_by_type(session, location_type)
    search_result_list = []

    for location in locations:
        search_result = LocationDetail(
            id=location.id,
            name=location.name,
            description=location.description,
            display_name=location.display_name,
            aliases=location.aliases,
            location_type=location.location_type,
            building_id=location.building.building_id if location.building else None,
            building_code=location.building.building_code if location.building else None,
            building_name=location.building.display_name if location.building else None,
            floor_id=location.floor_id,
            area_name=location.area_name,
            latitude=location.latitude,
            longitude=location.longitude,
            boundaries=location.boundaries,
            nearest_node_id=location.nearest_node_id,
            nearest_bus_stop_id=location.nearest_bus_stop_id,
            landmark_hint=location.landmark_hint,
            arrival_instruction=location.arrival_instruction,
            crowd_density=location.crowd_density,
            opening_hours=location.opening_hours,
            canteen=location.canteen,
        )
        search_result_list.append(search_result)

    return search_result_list
    

