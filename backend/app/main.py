from fastapi import FastAPI
from routers import locations, campus_map, routes, saves, users, recent_locations, auth, health, buses, events

app = FastAPI(title="Routes@NUS Backend")

app.include_router(locations.router)
app.include_router(routes.router)
app.include_router(campus_map.router)
app.include_router(saves.router)
app.include_router(users.router)
app.include_router(recent_locations.router)
app.include_router(auth.router)
app.include_router(health.router)
app.include_router(buses.router)
app.include_router(events.router)