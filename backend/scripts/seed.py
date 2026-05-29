import asyncio

from sqlalchemy import select

from core.database import AsyncSessionLocal
from models.locations import Location
from models.map_nodes import Map_Node
from models.map_edges import Map_Edge


async def seed_locations(session):
    """
    Add Location rows here later.

    A Location is a user-facing place:
    - LT14
    - Central Library
    - COM1
    - UTown Bus Stop
    - A classroom
    """

    locations = [
        # Example shape only:
        #
        # Location(
        #     id="some_location_id",
        #     name="some_location_name",
        #     display_name="Some Location",
        #     aliases=[],
        #     location_type="building",
        #     building_code=None,
        #     building_name=None,
        #     floor=None,
        #     available_floors=[],
        #     area_name=None,
        #     latitude=None,
        #     longitude=None,
        #     nearest_node_id="some_node_id",
        #     nearest_bus_stop_id=None,
        #     landmark_hint=None,
        #     arrival_instruction=None,
        # ),
    ]

    session.add_all(locations)


async def seed_map_nodes(session):
    """
    Add Map_Node rows here later.

    A Map_Node is a routeable graph point:
    - bus stop
    - building entrance
    - walkway junction
    - staircase
    - lift lobby
    - room door
    """

    nodes = [
        # Example shape only:
        #
        # Map_Node(
        #     id="some_node_id",
        #     name="Some Node",
        #     node_type="junction",
        #     building_code=None,
        #     floor=None,
        #     latitude=None,
        #     longitude=None,
        #     x=None,
        #     y=None,
        #     is_accessible=True,
        # ),
    ]

    session.add_all(nodes)


async def seed_map_edges(session):
    """
    Add Map_Edge rows here later.

    A Map_Edge is a connection between two nodes:
    - walking path
    - stairs
    - lift
    - shuttle/bus ride
    """

    edges = [
        # Example shape only:
        #
        # Map_Edge(
        #     id="some_edge_id",
        #     from_node_id="from_node_id",
        #     to_node_id="to_node_id",
        #     mode="walk",
        #     distance_m=0.0,
        #     estimated_seconds=0.0,
        #     accessible=True,
        #     sheltered=False,
        #     instruction="Walk from A to B.",
        #     geometry=[],
        # ),
    ]

    session.add_all(edges)


async def clear_existing_data(session):
    """
    Optional: clears existing seed data before reseeding.

    Order matters:
    - delete edges first because edges reference nodes
    - delete locations before/after nodes depending on FK setup
    - delete nodes last
    """

    await session.execute(Map_Edge.__table__.delete())
    await session.execute(Location.__table__.delete())
    await session.execute(Map_Node.__table__.delete())


async def seed_database(clear_first: bool = False):
    async with AsyncSessionLocal() as session:
        try:
            if clear_first:
                await clear_existing_data(session)

            await seed_map_nodes(session)
            await seed_locations(session)
            await seed_map_edges(session)

            await session.commit()
            print("Database seeded successfully.")

        except Exception:
            await session.rollback()
            print("Database seeding failed. Rolled back changes.")
            raise


if __name__ == "__main__":
    asyncio.run(seed_database(clear_first=False))