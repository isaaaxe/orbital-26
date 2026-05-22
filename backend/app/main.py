from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import Base, engine, get_db
from app.models import Building
from app.schemas import BuildingCreate, BuildingRead

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup logic
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield

    # shutdown logic
    await engine.dispose()

app = FastAPI(
    title="Routes@NUS Backend",
    version="0.1.0",
    lifespan=lifespan
)

# some settings for local deving, to be edited before deploying
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "NUS navigation backend is running"}


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "Routes@NUS Backend"
    }

@app.post("/buildings", response_model=BuildingRead)
async def create_building(
    building_data: BuildingCreate,
    db: AsyncSession = Depends(get_db),
):
    building = Building(
        name=building_data.name,
        code=building_data.code,
        latitude=building_data.latitude,
        longitude=building_data.longitude,
    )

    db.add(building)
    await db.commit()
    await db.refresh(building)

    return building


@app.get("/buildings", response_model=list[BuildingRead])
async def get_buildings(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Building))
    buildings = result.scalars().all()

    return buildings