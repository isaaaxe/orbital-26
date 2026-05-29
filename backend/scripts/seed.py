import asyncio
from math import radians, sin, cos, sqrt, atan2

from core.database import AsyncSessionLocal
from models.locations import Location
from models.map_nodes import Map_Node
from models.map_edges import Map_Edge


BUS_SPEED_MPS = 6.0


def haversine_m(lat1, lon1, lat2, lon2):
    radius_m = 6371000

    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)

    a = (
        sin(dlat / 2) ** 2
        + cos(radians(lat1))
        * cos(radians(lat2))
        * sin(dlon / 2) ** 2
    )

    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return radius_m * c


def node_id_from_name(name: str) -> str:
    return (
        "node_"
        + name.lower()
        .replace(":", "")
        .replace("#", "")
        .replace("=>", "")
        .replace("-", "_")
        .replace(" ", "_")
    )


def edge_id_from_nodes(from_node_id: str, to_node_id: str) -> str:
    return f"edge_{from_node_id}_to_{to_node_id}"


async def clear_existing_data(session):
    """
    Clear old seed data so this script can be rerun.
    Edges first because they reference nodes.
    """
    await session.execute(Map_Edge.__table__.delete())
    await session.execute(Location.__table__.delete())
    await session.execute(Map_Node.__table__.delete())


async def seed_data(clear_first: bool = True):
    async with AsyncSessionLocal() as session:
        try:
            if clear_first:
                await clear_existing_data(session)

            route_points = [
                ("UTown bus stop", 1.303662152778908, 103.77474325618729),
                ("UTown bus stop turn 1", 1.3036898595397952, 103.77503436441853),
                ("College circus entrance", 1.3037139930571071, 103.77552252761735),
                ("College circus turn 1", 1.303848068963592, 103.7755761721078),
                ("College circus turn 2", 1.3038346613625778, 103.77568614316255),
                ("College circus turn 3", 1.3036925408481457, 103.77568346083004),
                ("Utown bus exit", 1.3033982880444026, 103.77438865090716),
                ("College Link Road turn 1", 1.3028960536789422, 103.77397057589184),
                ("College Link Road turn 2", 1.3026230268821215, 103.77396383277252),
                ("College Link Road turn 3", 1.3013845763498575, 103.77446762012752),
                ("Kent Ridge Kres roundabout opening 1", 1.3009097750447332, 103.7743715005148),
                ("Kent Ridge Kres roundabout opening 2", 1.3005879928037967, 103.77434467844384),
                ("Kent Ridge Kres curve corner 1", 1.300159870737548, 103.77459395813739),
                ("Kent Ridge Kres circus opening 1", 1.299659816384449, 103.77465538415147),
                ("Kent Ridge Kres circus turn 1", 1.2993396062334828, 103.7747475230997),
                ("Kent Ridge Kres circus opening 2", 1.2992518774012725, 103.77448865654488),
                ("Kent Ridge Kres curve corner 2", 1.2984359993051184, 103.7739007222745),
                ("Kent Ridge Kres curve corner 3", 1.2978701480748156, 103.77311095987058),
                ("Central Library bus stop", 1.296576146570338, 103.7725537384373),
            ]

            nodes = [
                Map_Node(
                    node_id=node_id_from_name(name),
                    name=name,
                    node_type="route_point",
                    building_id="campus_bus_route",
                    building_code=None,
                    floor=1,
                    latitude=lat,
                    longitude=lon,
                )
                for name, lat, lon in route_points
            ]

            locations = [
                Location(
                    id="utown_bus_stop",
                    name="utown_bus_stop",
                    display_name="UTown Bus Stop",
                    aliases=["UTown", "University Town", "U Town Bus Stop"],
                    location_type="bus_stop",
                    building_code=None,
                    building_name=None,
                    floor=1,
                    available_floors=[1],
                    area_name="UTown",
                    latitude=1.303662152778908,
                    longitude=103.77474325618729,
                    nearest_node_id="node_utown_bus_stop",
                    nearest_bus_stop_id="node_utown_bus_stop",
                    landmark_hint=None,
                    arrival_instruction=None,
                ),
                Location(
                    id="central_library_bus_stop",
                    name="central_library_bus_stop",
                    display_name="Central Library Bus Stop",
                    aliases=["CLB Bus Stop", "Central Library Stop"],
                    location_type="bus_stop",
                    building_code="CLB",
                    building_name="Central Library",
                    floor=1,
                    available_floors=[1],
                    area_name="Kent Ridge",
                    latitude=1.296576146570338,
                    longitude=103.7725537384373,
                    nearest_node_id="node_central_library_bus_stop",
                    nearest_bus_stop_id="node_central_library_bus_stop",
                    landmark_hint=None,
                    arrival_instruction=None,
                ),
            ]

            edges = []

            for index in range(len(route_points) - 1):
                from_name, from_lat, from_lon = route_points[index]
                to_name, to_lat, to_lon = route_points[index + 1]

                from_node_id = node_id_from_name(from_name)
                to_node_id = node_id_from_name(to_name)

                distance_m = haversine_m(from_lat, from_lon, to_lat, to_lon)
                estimated_seconds = distance_m / BUS_SPEED_MPS

                edges.append(
                    Map_Edge(
                        edge_id=edge_id_from_nodes(from_node_id, to_node_id),
                        from_node_id=from_node_id,
                        to_node_id=to_node_id,
                        mode="shuttle",
                        distance_m=round(distance_m),
                        estimated_seconds=round(estimated_seconds, 1),
                        instruction=None,
                        geometry=[
                            [from_lon, from_lat],
                            [to_lon, to_lat],
                        ],
                    )
                )

            session.add_all(nodes)
            session.add_all(locations)
            session.add_all(edges)

            await session.commit()
            print("Seed data inserted successfully.")
            print(f"Inserted {len(locations)} locations.")
            print(f"Inserted {len(nodes)} nodes.")
            print(f"Inserted {len(edges)} edges.")

        except Exception:
            await session.rollback()
            print("Seed data failed. Rolled back changes.")
            raise


if __name__ == "__main__":
    asyncio.run(seed_data(clear_first=True))