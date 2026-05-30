from repositories import save_repository, location_repository
from schemas.save import SaveResponse
from models.saved_locations import Saved_Location
from models.locations import Location

async def get_user_saves(session, user_id):
    rows = await save_repository.get_user_saves(session, user_id)

    saved_locations = []
    for saved_location, location in rows:
        saved_location: Saved_Location
        location: Location
        save = SaveResponse(
            save_id=saved_location.id,
            location_id=location.id,
            name=location.name,
            display_name=location.display_name,
            location_type=location.location_type,
            building_code=location.building_code,
            area_name=location.area_name,
            purpose=saved_location.purpose,
        )

        saved_locations.append(save)
    
    return saved_locations

async def add_user_save(session, user_id, location_id, purpose):
    saved_location: Saved_Location = await save_repository.add_user_save(session, user_id, location_id, purpose)

    if saved_location is None:
        return None
    
    location: Location = await location_repository.get_location_by_id(session, saved_location.location_id)

    if location is None:
        return None

    save = SaveResponse(
            save_id=saved_location.id,
            location_id=location.id,
            name=location.name,
            display_name=location.display_name,
            location_type=location.location_type,
            building_code=location.building_code,
            area_name=location.area_name,
            purpose=saved_location.purpose,
        )
    
    return save

#add the patch function here later when we implement purpose in frontend 

async def delete_user_save(session, user_id, location_id):
    boolean = await save_repository.delete_user_save(session, user_id, location_id)

    return boolean
