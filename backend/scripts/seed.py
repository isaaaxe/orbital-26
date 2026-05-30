import asyncio
import re
from math import atan2, cos, radians, sin, sqrt

from core.database import AsyncSessionLocal
from models.locations import Location
from models.map_edges import Map_Edge
from models.map_nodes import Map_Node


WALK_SPEED_MPS = 1.4
BUS_SPEED_MPS = 6.0


def haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius_m = 6_371_000

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


def slugify(value: str) -> str:
    value = value.lower().strip()
    value = value.replace("&", "and")
    value = re.sub(r"[^a-z0-9]+", "_", value)
    value = re.sub(r"_+", "_", value)
    return value.strip("_")


def node_id_from_name(name: str) -> str:
    return f"node_{slugify(name)}"


def edge_id_from_names(from_name: str, to_name: str) -> str:
    return f"edge_{slugify(from_name)}_to_{slugify(to_name)}"


def location_id_from_name(name: str) -> str:
    return f"loc_{slugify(name)}"


def speed_for_mode(mode: str) -> float:
    if mode == "campus bus":
        return BUS_SPEED_MPS
    return WALK_SPEED_MPS


def format_instruction(instruction: str | None, distance_m: int) -> str | None:
    if instruction is None:
        return None

    cleaned = instruction.strip()

    if cleaned in {"", "“”", '""'}:
        return ""

    return cleaned.replace("calculated distance", f"{distance_m} m")


async def clear_existing_data(session):
    await session.execute(Map_Edge.__table__.delete())
    await session.execute(Location.__table__.delete())
    await session.execute(Map_Node.__table__.delete())


async def seed_data(clear_first: bool = True):
    async with AsyncSessionLocal() as session:
        try:
            if clear_first:
                await clear_existing_data(session)

            node_specs = [
                {
                    "name": "COM3 Elevator",
                    "lat": 1.2946253,
                    "lon": 103.7749732,
                    "node_type": "lift station",
                    "floor": 1,
                    "building_code": "com3",
                },
                {
                    "name": "Com3 MPH1",
                    "lat": 1.2946126,
                    "lon": 103.7747248,
                    "node_type": "multipurpose hall",
                    "floor": 1,
                    "building_code": "com3",
                },
                {
                    "name": "The Terrace",
                    "lat": 1.2944054,
                    "lon": 103.7743158,
                    "node_type": "canteen",
                    "floor": 1,
                    "building_code": "com3",
                },
                {
                    "name": "Com2 entrance",
                    "lat": 1.2943984,
                    "lon": 103.7739848,
                    "node_type": "entrance",
                    "floor": 1,
                    "building_code": "com2",
                },
                {
                    "name": "Com1 level 1 entrance",
                    "lat": 1.2948261,
                    "lon": 103.7736496,
                    "node_type": "entrance",
                    "floor": 1,
                    "building_code": "com1",
                },
                {
                    "name": "UTown bus stop",
                    "lat": 1.303662152778908,
                    "lon": 103.77474325618729,
                    "node_type": "bus stop",
                    "floor": 1,
                    "building_code": "UTown",
                },
                {
                    "name": "UTown bus stop turn 1",
                    "lat": 1.3036898595397952,
                    "lon": 103.77503436441853,
                    "node_type": "road",
                    "floor": 1,
                    "building_code": "road",
                },
                {
                    "name": "College circus entrance",
                    "lat": 1.3037139930571071,
                    "lon": 103.77552252761735,
                    "node_type": "road",
                    "floor": 1,
                    "building_code": "road",
                },
                {
                    "name": "College circus turn 1",
                    "lat": 1.303848068963592,
                    "lon": 103.7755761721078,
                    "node_type": "road",
                    "floor": 1,
                    "building_code": "road",
                },
                {
                    "name": "College circus turn 2",
                    "lat": 1.3038346613625778,
                    "lon": 103.77568614316255,
                    "node_type": "road",
                    "floor": 1,
                    "building_code": "road",
                },
                {
                    "name": "College circus turn 3",
                    "lat": 1.3036925408481457,
                    "lon": 103.77568346083004,
                    "node_type": "road",
                    "floor": 1,
                    "building_code": "road",
                },
                {
                    "name": "Utown bus exit",
                    "lat": 1.3033982880444026,
                    "lon": 103.77438865090716,
                    "node_type": "road",
                    "floor": 1,
                    "building_code": "road",
                },
                {
                    "name": "College Link Road turn 1",
                    "lat": 1.3028960536789422,
                    "lon": 103.77397057589184,
                    "node_type": "road",
                    "floor": 1,
                    "building_code": "road",
                },
                {
                    "name": "College Link Road turn 2",
                    "lat": 1.3026230268821215,
                    "lon": 103.77396383277252,
                    "node_type": "road",
                    "floor": 1,
                    "building_code": "road",
                },
                {
                    "name": "College Link Road turn 3",
                    "lat": 1.3013845763498575,
                    "lon": 103.77446762012752,
                    "node_type": "road",
                    "floor": 1,
                    "building_code": "road",
                },
                {
                    "name": "Kent Ridge Kres roundabout opening 1",
                    "lat": 1.3009097750447332,
                    "lon": 103.7743715005148,
                    "node_type": "road",
                    "floor": 1,
                    "building_code": "road",
                },
                {
                    "name": "Kent Ridge Kres roundabout opening 2",
                    "lat": 1.3005879928037967,
                    "lon": 103.77434467844384,
                    "node_type": "road",
                    "floor": 1,
                    "building_code": "road",
                },
                {
                    "name": "Kent Ridge Kres curve corner 1",
                    "lat": 1.300159870737548,
                    "lon": 103.77459395813739,
                    "node_type": "road",
                    "floor": 1,
                    "building_code": "road",
                },
                {
                    "name": "Kent Ridge Kres circus opening 1",
                    "lat": 1.299659816384449,
                    "lon": 103.77465538415147,
                    "node_type": "road",
                    "floor": 1,
                    "building_code": "road",
                },
                {
                    "name": "Kent Ridge Kres circus turn 1",
                    "lat": 1.2993396062334828,
                    "lon": 103.7747475230997,
                    "node_type": "road",
                    "floor": 1,
                    "building_code": "road",
                },
                {
                    "name": "Kent Ridge Kres circus opening 2",
                    "lat": 1.2992518774012725,
                    "lon": 103.77448865654488,
                    "node_type": "road",
                    "floor": 1,
                    "building_code": "road",
                },
                {
                    "name": "Kent Ridge Kres curve corner 2",
                    "lat": 1.2984359993051184,
                    "lon": 103.7739007222745,
                    "node_type": "road",
                    "floor": 1,
                    "building_code": "road",
                },
                {
                    "name": "Kent Ridge Kres curve corner 3",
                    "lat": 1.2978701480748156,
                    "lon": 103.77311095987058,
                    "node_type": "road",
                    "floor": 1,
                    "building_code": "road",
                },
                {
                    "name": "Central Library bus stop",
                    "lat": 1.296576146570338,
                    "lon": 103.7725537384373,
                    "node_type": "bus stop",
                    "floor": 1,
                    "building_code": "central library bus stop",
                },
                {
                    "name": "Central library stairs",
                    "lat": 1.2962775,
                    "lon": 103.7727135,
                    "node_type": "stairs",
                    "floor": 1,
                    "building_code": "clb",
                },
                {
                    "name": "Central library entrance",
                    "lat": 1.2964906,
                    "lon": 103.7731269,
                    "node_type": "entrance",
                    "floor": 1,
                    "building_code": "clb",
                },
                {
                    "name": "Central library lift",
                    "lat": 1.2961927,
                    "lon": 103.7731590,
                    "node_type": "lift_station",
                    "floor": 1,
                    "building_code": "clb",
                },
                {
                    "name": "Outside nus coop store room",
                    "lat": 1.2958464,
                    "lon": 103.7730990,
                    "node_type": "corner",
                    "floor": 1,
                    "building_code": "as6",
                },
                {
                    "name": "Outside LT14",
                    "lat": 1.2956714,
                    "lon": 103.7732274,
                    "node_type": "lecture theatre",
                    "floor": 1,
                    "building_code": "as6",
                },
                {
                    "name": "Outside LT15",
                    "lat": 1.2954475,
                    "lon": 103.7732784,
                    "node_type": "lecture theatre",
                    "floor": 1,
                    "building_code": "as6",
                },
                {
                    "name": "As6 lift1",
                    "lat": 1.2952890,
                    "lon": 103.7733153,
                    "node_type": "lift station",
                    "floor": 1,
                    "building_code": "as6",
                },
                {
                    "name": "Com1 second story outside ahu room",
                    "lat": 1.2954026,
                    "lon": 103.7735443,
                    "node_type": "corner",
                    "floor": 2,
                    "building_code": "com1",
                },
                {
                    "name": "Com1 level 2 entrance",
                    "lat": 1.2952803,
                    "lon": 103.7737270,
                    "node_type": "entrance",
                    "floor": 2,
                    "building_code": "com1",
                },
                {
                    "name": "Middle of stairs from terrace to com1",
                    "lat": 1.2944709,
                    "lon": 103.7741018,
                    "node_type": "corner",
                    "floor": 1,
                    "building_code": "com2",
                },
                {
                    "name": "Com1",
                    "lat": 1.294946722798136,
                    "lon": 103.77393194938502,
                    "node_type": "building",
                    "floor": 1,
                    "building_code": "com1",
                },
                {
                    "name": "Com2",
                    "lat": 1.294265259902769,
                    "lon": 103.77409799286686,
                    "node_type": "building",
                    "floor": 1,
                    "building_code": "com2",
                },
                {
                    "name": "Com3",
                    "lat": 1.2947281501787837,
                    "lon": 103.77459031912267,
                    "node_type": "building",
                    "floor": 1,
                    "building_code": "com3",
                },
                {
                    "name": "LT15",
                    "lat": 1.2955214878116914,
                    "lon": 103.77344062919603,
                    "node_type": "lecture theatre",
                    "floor": 1,
                    "building_code": "as6",
                },
                {
                    "name": "LT14",
                    "lat": 1.2957011498687994,
                    "lon": 103.77337290341598,
                    "node_type": "lecture theatre",
                    "floor": 1,
                    "building_code": "as6",
                },
            ]

            node_by_name = {node["name"]: node for node in node_specs}

            nodes = [
                Map_Node(
                    node_id=node_id_from_name(node["name"]),
                    name=node["name"],
                    node_type=node["node_type"],
                    building_id=node["building_code"],
                    building_code=node["building_code"],
                    floor=node["floor"],
                    latitude=node["lat"],
                    longitude=node["lon"],
                )
                for node in node_specs
            ]

            location_specs = [
                {
                    "name": "Central Library",
                    "display_name": "Central Library",
                    "aliases": ["CLB"],
                    "location_type": "central library",
                    "building_code": "clb",
                    "building_name": "CLB",
                    "floor": 1,
                    "available_floors": [1, 2, 3, 4],
                    "area_name": None,
                    "lat": 1.2966200954063662,
                    "lon": 103.77312890647435,
                    "nearest_node_name": "Central library entrance",
                    "nearest_bus_stop_name": "Central Library bus stop",
                },
                {
                    "name": "Lecture Theatre 15",
                    "display_name": "Lecture Theatre 15",
                    "aliases": ["LT15", "LT 15"],
                    "location_type": "lecture theatre",
                    "building_code": "as6",
                    "building_name": "LT15",
                    "floor": 1,
                    "available_floors": [],
                    "area_name": None,
                    "lat": 1.2955214878116914,
                    "lon": 103.77344062919603,
                    "nearest_node_name": "LT15",
                    "nearest_bus_stop_name": "Central Library bus stop",
                },
                {
                    "name": "Lecture Theatre 14",
                    "display_name": "Lecture Theatre 14",
                    "aliases": ["LT14", "LT 14"],
                    "location_type": "lecture theatre",
                    "building_code": "as6",
                    "building_name": "LT14",
                    "floor": 1,
                    "available_floors": [],
                    "area_name": None,
                    "lat": 1.2957011498687994,
                    "lon": 103.77337290341598,
                    "nearest_node_name": "LT14",
                    "nearest_bus_stop_name": "Central Library bus stop",
                },
                {
                    "name": "COM1",
                    "display_name": "COM1",
                    "aliases": ["COM1", "Computing 1"],
                    "location_type": "COM",
                    "building_code": "com1",
                    "building_name": "com1",
                    "floor": 1,
                    "available_floors": [-1, 1, 2, 3],
                    "area_name": "school of computing",
                    "lat": 1.294946722798136,
                    "lon": 103.77393194938502,
                    "nearest_node_name": "Com1",
                    "nearest_bus_stop_name": "Central Library bus stop",
                },
                {
                    "name": "COM2",
                    "display_name": "COM2",
                    "aliases": ["COM2", "Computing 2"],
                    "location_type": "COM",
                    "building_code": "com2",
                    "building_name": "com2",
                    "floor": 1,
                    "available_floors": [-2, -1, 1, 2, 3, 4, 5, 6],
                    "area_name": "school of computing",
                    "lat": 1.294265259902769,
                    "lon": 103.77409799286686,
                    "nearest_node_name": "Com2",
                    "nearest_bus_stop_name": "Central Library bus stop",
                },
                {
                    "name": "COM3",
                    "display_name": "COM3",
                    "aliases": ["COM3", "Computing 3"],
                    "location_type": "COM",
                    "building_code": "com3",
                    "building_name": "com3",
                    "floor": 1,
                    "available_floors": [-1, 1, 2],
                    "area_name": "school of computing",
                    "lat": 1.2947281501787837,
                    "lon": 103.77459031912267,
                    "nearest_node_name": "Com3",
                    "nearest_bus_stop_name": "Central Library bus stop",
                },
                {
                    "name": "Terrace",
                    "display_name": "Terrace",
                    "aliases": ["The Terrace"],
                    "location_type": "canteen",
                    "building_code": "com3",
                    "building_name": "Terrace",
                    "floor": 1,
                    "available_floors": [],
                    "area_name": "school of computing",
                    "lat": 1.2944054,
                    "lon": 103.7743158,
                    "nearest_node_name": "The Terrace",
                    "nearest_bus_stop_name": "Central Library bus stop",
                },
            ]

            locations = [
                Location(
                    id=location_id_from_name(location["name"]),
                    name=location["name"],
                    description="",
                    display_name=location["display_name"],
                    aliases=location["aliases"],
                    location_type=location["location_type"],
                    building_code=location["building_code"],
                    building_name=location["building_name"],
                    floor=location["floor"],
                    available_floors=location["available_floors"],
                    area_name=location["area_name"],
                    latitude=location["lat"],
                    longitude=location["lon"],
                    nearest_node_id=node_id_from_name(location["nearest_node_name"]),
                    nearest_bus_stop_id=node_id_from_name(location["nearest_bus_stop_name"]),
                    landmark_hint=None,
                    arrival_instruction=None,
                )
                for location in location_specs
            ]

            edge_specs = [
                ("COM3 Elevator", "Com3 MPH1", "walk", "walk straight down corridor for calculated distance", None),
                ("Com3 MPH1", "The Terrace", "walk", "walk straight down corridor for calculated distance", None),
                ("The Terrace", "Com2 entrance", "walk", "walk straight for calculated distance", None),
                ("The Terrace", "Com1 level 1 entrance", "walk", "walk straight for calculated distance", None),

                ("UTown bus stop", "UTown bus stop turn 1", "campus bus", "Start at UTown bus stop and head towards College entrance", "arriving at UTown Bus Stop"),
                ("UTown bus stop turn 1", "College circus entrance", "campus bus", "continue around College Circus towards UTown bus exit", "heading towards UTown Bus stop"),
                ("College circus entrance", "College circus turn 1", "campus bus", "", None),
                ("College circus turn 1", "College circus turn 2", "campus bus", "", None),
                ("College circus turn 2", "College circus turn 3", "campus bus", "", None),
                ("College circus turn 3", "College circus entrance", "campus bus", "", None),
                ("College circus entrance", "Utown bus exit", "campus bus", "exiting Utown", "entering UTown"),
                ("Utown bus exit", "College Link Road turn 1", "campus bus", "follow College Link road", None),
                ("College Link Road turn 1", "College Link Road turn 2", "campus bus", "follow College Link road", None),
                ("College Link Road turn 2", "College Link Road turn 3", "campus bus", "follow College Link road", None),
                ("College Link Road turn 3", "Kent Ridge Kres roundabout opening 1", "campus bus", "entering kent ridge kres roundabout", "exiting kent ridge kres roundabout"),
                ("Kent Ridge Kres roundabout opening 1", "Kent Ridge Kres roundabout opening 2", "campus bus", "", None),
                ("Kent Ridge Kres roundabout opening 2", "Kent Ridge Kres curve corner 1", "campus bus", "follow Kent Ridge Kres", None),
                ("Kent Ridge Kres curve corner 1", "Kent Ridge Kres circus opening 1", "campus bus", "enter Kent Ridge Kres circus", "exit kent ridge Kres circus"),
                ("Kent Ridge Kres circus opening 1", "Kent Ridge Kres circus turn 1", "campus bus", "", None),
                ("Kent Ridge Kres circus turn 1", "Kent Ridge Kres circus opening 2", "campus bus", "exit Kent Ridge Kres circus", "enter kent ridge kres circus"),
                ("Kent Ridge Kres circus opening 2", "Kent Ridge Kres curve corner 2", "campus bus", "follow Kent Ridge Kres", None),
                ("Kent Ridge Kres curve corner 2", "Kent Ridge Kres curve corner 3", "campus bus", "follow Kent Ridge Kres", None),
                ("Kent Ridge Kres curve corner 3", "Central Library bus stop", "campus bus", "arriving at central library bus stop", "exiting central library bus stop"),

                ("Central Library bus stop", "Central library stairs", "walk", "walk down the stairs", "walk up the stairs"),
                ("Central library stairs", "Central library entrance", "walk", "walk straight for calculated distance", None),
                ("Central library entrance", "Central library lift", "walk", "walk straight for calculated distance", None),
                ("Central library lift", "Outside nus coop store room", "walk", "walk up stairs", "walk down stairs"),
                ("Outside nus coop store room", "Outside LT14", "walk", "walk straight for calculated distance", None),
                ("Outside LT14", "Outside LT15", "walk", "walk straight for calculated distance", None),
                ("Outside LT15", "As6 lift1", "walk", "walk straight for calculated distance", None),
                ("As6 lift1", "Com1 second story outside ahu room", "walk", "turn left, walk straight for calculated distance and turn right", "turn left, walk straight for calculated distance and turn right"),
                ("Com1 second story outside ahu room", "Com1 level 2 entrance", "walk", "walk straight for calculated distance", None),
                ("Com1 level 2 entrance", "Middle of stairs from terrace to com1", "walk", "walk straight through com1 for calculated distance", None),
                ("Middle of stairs from terrace to com1", "The Terrace", "walk", "walk down stairs and straight for calculated distance", None),

                ("Outside LT14", "LT14", "walk", "walk down stairs and straight for calculated distance", None),
                ("Outside LT15", "LT15", "walk", "walk down stairs and straight for calculated distance", None),
                ("Com1 level 2 entrance", "Com1", "walk", "walk straight for calculated distance", None),
                ("Com2 entrance", "Com2", "walk", "walk through the entrance and turn left", None),
            ]

            edges = []

            for from_name, to_name, mode, instruction, reverse_instruction in edge_specs:
                from_node = node_by_name[from_name]
                to_node = node_by_name[to_name]

                distance_float = haversine_m(
                    from_node["lat"],
                    from_node["lon"],
                    to_node["lat"],
                    to_node["lon"],
                )
                distance_m = round(distance_float)
                estimated_seconds = round(distance_float / speed_for_mode(mode), 1)

                from_node_id = node_id_from_name(from_name)
                to_node_id = node_id_from_name(to_name)

                edges.append(
                    Map_Edge(
                        edge_id=edge_id_from_names(from_name, to_name),
                        from_node_id=from_node_id,
                        to_node_id=to_node_id,
                        mode=mode,
                        distance_m=distance_m,
                        estimated_seconds=estimated_seconds,
                        instruction=format_instruction(instruction, distance_m),
                        geometry=[
                            [from_node["lon"], from_node["lat"]],
                            [to_node["lon"], to_node["lat"]],
                        ],
                    )
                )

                reverse_text = reverse_instruction if reverse_instruction is not None else instruction

                edges.append(
                    Map_Edge(
                        edge_id=edge_id_from_names(to_name, from_name),
                        from_node_id=to_node_id,
                        to_node_id=from_node_id,
                        mode=mode,
                        distance_m=distance_m,
                        estimated_seconds=estimated_seconds,
                        instruction=format_instruction(reverse_text, distance_m),
                        geometry=[
                            [to_node["lon"], to_node["lat"]],
                            [from_node["lon"], from_node["lat"]],
                        ],
                    )
                )

            session.add_all(nodes)
            session.add_all(locations)
            session.add_all(edges)

            await session.commit()

            print("Seed data inserted successfully.")
            print(f"Inserted {len(nodes)} nodes.")
            print(f"Inserted {len(locations)} locations.")
            print(f"Inserted {len(edges)} bidirectional edges.")

        except Exception:
            await session.rollback()
            print("Seed data failed. Rolled back changes.")
            raise


if __name__ == "__main__":
    asyncio.run(seed_data(clear_first=True))