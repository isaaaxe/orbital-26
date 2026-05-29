from fastapi import FastAPI
from routers import locations, campus_map, routes, saves, users

app = FastAPI(title="Routes@NUS Backend")

app.include_router(locations.router)
app.include_router(routes.router)
app.include_router(campus_map.router)
app.include_router(saves.router)
app.include_router(users.router)
