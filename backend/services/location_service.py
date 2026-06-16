from repositories import location_repository
from schemas.location import LocationDetail

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
            building_code=location.building.building_code if location.building else None,
            building_name=location.building.display_name if location.building else None,
            floor_id=location.floor_id,
            area_name=location.area_name,
            latitude=location.latitude,
            longitude=location.longitude,
            nearest_node_id=location.nearest_node_id,
            nearest_bus_stop_id=location.nearest_bus_stop_id,
            landmark_hint=location.landmark_hint,
            arrival_instruction=location.arrival_instruction
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
        building_code=location.building.building_code if location.building else None,
        building_name=location.building.display_name if location.building else None,
        floor_id=location.floor_id,
        area_name=location.area_name,
        latitude=location.latitude,
        longitude=location.longitude,
        nearest_node_id=location.nearest_node_id,
        nearest_bus_stop_id=location.nearest_bus_stop_id,
        landmark_hint=location.landmark_hint,
        arrival_instruction=location.arrival_instruction
    )

