from repositories import recent_repository, location_repository
from schemas.recent_location import RecentLocationResponse
from models.recent_locations import Recent_Location
from models.locations import Location

async def get_recent_locations(session, current_user):
    responses = []

    recent_locations = await recent_repository.get_recent_locations(session, current_user.user_id)


    for recent_location, location in recent_locations:
        recent_location: Recent_Location
        location: Location

        response = RecentLocationResponse(
            recent_id=recent_location.recent_id,
            location_id=recent_location.location_id,
            name=location.name,
            time=recent_location.time,
            description=location.description,
            display_name=location.display_name,
            location_type=location.location_type,
            building_code=location.building_code,
            area_name=location.area_name,
        )
        responses.append(response)
    
    return responses

async def update_recent_location(session, current_user, location_id):
    recent_location: Recent_Location = await recent_repository.update_recent_location(session, current_user.user_id, location_id)

    if recent_location is None:
        return None
    
    location : Location = await location_repository.get_location_by_id(session, recent_location.location_id)
    
    response = RecentLocationResponse(
        recent_id=recent_location.recent_id,
        location_id=recent_location.location_id,
        name=location.name,
        time=recent_location.time,
        description=location.description,
        display_name=location.display_name,
        location_type=location.location_type,
        building_code=location.building_code,
        area_name=location.area_name,
    )

    return response

async def delete_recent_location(session, current_user, location_id):
    boolean = await recent_repository.delete_recent_location(session, current_user.user_id, location_id)

    return boolean

async def delete_all_recent_locations(session, current_user):
    boolean = await recent_repository.delete_all_recent_locations(session, current_user.user_id)

    return boolean 