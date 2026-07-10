from schemas.event import EventResponse
from repositories import event_repository
from models.events import Event

async def get_upcoming_events(session, date_range):
    events = await event_repository.get_upcoming_events(session, date_range)
    search_result_list =[]

    for event in events:
        event: Event
        search_result = EventResponse(
            event_id=event.event_id,
            name=event.name,
            start_date=event.start_date,
            end_date=event.end_date,
            description=event.description,
            categories=event.categories,
            audiences=event.audiences,
            image_url=event.image_url,
            event_url=event.event_url,
        )
        search_result_list.append(search_result)
    
    return search_result_list

