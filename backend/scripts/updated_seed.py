import asyncio
import json
import os
import re
import sys 
from math import atan2, cos, radians, sin, sqrt
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from core.database import AsyncSessionLocal
from models.locations import Location
from models.map_edges import Map_Edge
from models.map_nodes import Map_Node
from models.users import User
from models.saved_locations import Saved_Location
from models.recent_locations import Recent_Location
from models.buildings import Building
from models.floors import Floor


# ----------------------------------------------------------------------------
# config
# ----------------------------------------------------------------------------
WALK_SPEED_MPS = 1.4
BUS_SPEED_MPS = 6.0

# fixed vertical-travel times (Section 2 #6). Multiplied by number of floors crossed.
LIFT_SECONDS_PER_FLOOR = 15
STAIR_SECONDS_PER_FLOOR = 20

# FK strategy = option (b): only these get Building rows. Every other building_code
# on a node/location is stored as NULL (roads, bus stops, com3, clb, as6, ... for now).
SEEDED_BUILDINGS = {"com1", "com2"}

# Floor-plan images. Point this at wherever you host them (see notes at bottom).
#   Supabase public bucket:  https://<proj>.supabase.co/storage/v1/object/public/floors
#   FastAPI StaticFiles:     /static/floors
IMAGE_BASE_URL = os.getenv("FLOOR_IMAGE_BASE_URL", "/static/floors").rstrip("/")

# Editor export (floors calibration + room nodes + edges). Optional.
MAP_DATA_JSON = Path(os.getenv("MAP_DATA_JSON", Path(__file__).parent / "routes_map_data.json"))


# ----------------------------------------------------------------------------
# helpers
# ----------------------------------------------------------------------------
def haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius_m = 6_371_000
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return radius_m * 2 * atan2(sqrt(a), sqrt(1 - a))


def slugify(value: str) -> str:
    value = value.lower().strip().replace("&", "and")
    value = re.sub(r"[^a-z0-9]+", "_", value)
    return re.sub(r"_+", "_", value).strip("_")


def node_id_from_name(name: str) -> str:
    return f"node_{slugify(name)}"


def edge_id_from_names(a: str, b: str) -> str:
    return f"edge_{slugify(a)}_to_{slugify(b)}"


def location_id_from_name(name: str) -> str:
    return f"loc_{slugify(name)}"


def speed_for_mode(mode: str) -> float:
    return BUS_SPEED_MPS if mode == "campus bus" else WALK_SPEED_MPS


def resolve_building_id(code):
    """Option (b): keep building_id only for buildings we actually seed; else NULL."""
    return code if code in SEEDED_BUILDINGS else None


def floor_name_for(n: int) -> str:
    if n < 0:
        return "Basement" if n == -1 else f"Basement {abs(n)}"
    if n == 0:
        return "Ground"
    return f"Level {n}"


def format_instruction(instruction, distance_m):
    if instruction is None:
        return None
    cleaned = instruction.strip()
    if cleaned in {"", "\u201c\u201d", '""'}:
        return ""
    return cleaned.replace("calculated distance", f"{distance_m} m")


# ----------------------------------------------------------------------------
# building specs
# ----------------------------------------------------------------------------
BUILDING_SPECS = [
    {
        "building_id": "com1", "building_code": "com1",
        "name": "COM1", "display_name": "COM1",
        "aliases": ["COM1", "Computing 1"], "area_name": "school of computing",
    },
    {
        "building_id": "com2", "building_code": "com2",
        "name": "COM2", "display_name": "COM2",
        "aliases": ["COM2", "Computing 2"], "area_name": "school of computing",
    },
]


# ----------------------------------------------------------------------------
# base nodes (outdoor + bus route + CLB/AS6/COM walking) -- unchanged data
# ----------------------------------------------------------------------------
BASE_NODE_SPECS = [
    {"name": "COM3 Elevator", "lat": 1.2946253, "lon": 103.7749732, "node_type": "lift_station", "floor": 1, "building_code": "com3"},
    {"name": "Com3 MPH1", "lat": 1.2946126, "lon": 103.7747248, "node_type": "multipurpose hall", "floor": 1, "building_code": "com3"},
    {"name": "The Terrace", "lat": 1.2944054, "lon": 103.7743158, "node_type": "canteen", "floor": 1, "building_code": "com3"},
    {"name": "Com2 entrance", "lat": 1.2943984, "lon": 103.7739848, "node_type": "entrance", "floor": 1, "building_code": "com2"},
    {"name": "Com1 level 1 entrance", "lat": 1.2948261, "lon": 103.7736496, "node_type": "entrance", "floor": 1, "building_code": "com1"},
    {"name": "UTown bus stop", "lat": 1.303662152778908, "lon": 103.77474325618729, "node_type": "bus stop", "floor": 1, "building_code": "UTown"},
    {"name": "UTown bus stop turn 1", "lat": 1.3036898595397952, "lon": 103.77503436441853, "node_type": "road", "floor": 1, "building_code": "road"},
    {"name": "College circus entrance", "lat": 1.3037139930571071, "lon": 103.77552252761735, "node_type": "road", "floor": 1, "building_code": "road"},
    {"name": "College circus turn 1", "lat": 1.303848068963592, "lon": 103.7755761721078, "node_type": "road", "floor": 1, "building_code": "road"},
    {"name": "College circus turn 2", "lat": 1.3038346613625778, "lon": 103.77568614316255, "node_type": "road", "floor": 1, "building_code": "road"},
    {"name": "College circus turn 3", "lat": 1.3036925408481457, "lon": 103.77568346083004, "node_type": "road", "floor": 1, "building_code": "road"},
    {"name": "Utown bus exit", "lat": 1.3033982880444026, "lon": 103.77438865090716, "node_type": "road", "floor": 1, "building_code": "road"},
    {"name": "College Link Road turn 1", "lat": 1.3028960536789422, "lon": 103.77397057589184, "node_type": "road", "floor": 1, "building_code": "road"},
    {"name": "College Link Road turn 2", "lat": 1.3026230268821215, "lon": 103.77396383277252, "node_type": "road", "floor": 1, "building_code": "road"},
    {"name": "College Link Road turn 3", "lat": 1.3013845763498575, "lon": 103.77446762012752, "node_type": "road", "floor": 1, "building_code": "road"},
    {"name": "Kent Ridge Kres roundabout opening 1", "lat": 1.3009097750447332, "lon": 103.7743715005148, "node_type": "road", "floor": 1, "building_code": "road"},
    {"name": "Kent Ridge Kres roundabout opening 2", "lat": 1.3005879928037967, "lon": 103.77434467844384, "node_type": "road", "floor": 1, "building_code": "road"},
    {"name": "Kent Ridge Kres curve corner 1", "lat": 1.300159870737548, "lon": 103.77459395813739, "node_type": "road", "floor": 1, "building_code": "road"},
    {"name": "Kent Ridge Kres circus opening 1", "lat": 1.299659816384449, "lon": 103.77465538415147, "node_type": "road", "floor": 1, "building_code": "road"},
    {"name": "Kent Ridge Kres circus turn 1", "lat": 1.2993396062334828, "lon": 103.7747475230997, "node_type": "road", "floor": 1, "building_code": "road"},
    {"name": "Kent Ridge Kres circus opening 2", "lat": 1.2992518774012725, "lon": 103.77448865654488, "node_type": "road", "floor": 1, "building_code": "road"},
    {"name": "Kent Ridge Kres curve corner 2", "lat": 1.2984359993051184, "lon": 103.7739007222745, "node_type": "road", "floor": 1, "building_code": "road"},
    {"name": "Kent Ridge Kres curve corner 3", "lat": 1.2978701480748156, "lon": 103.77311095987058, "node_type": "road", "floor": 1, "building_code": "road"},
    {"name": "Central Library bus stop", "lat": 1.296576146570338, "lon": 103.7725537384373, "node_type": "bus stop", "floor": 1, "building_code": "central library bus stop"},
    {"name": "Central library stairs", "lat": 1.2962775, "lon": 103.7727135, "node_type": "stairs", "floor": 1, "building_code": "clb"},
    {"name": "Central library entrance", "lat": 1.2964906, "lon": 103.7731269, "node_type": "entrance", "floor": 1, "building_code": "clb"},
    {"name": "Central library lift", "lat": 1.2961927, "lon": 103.7731590, "node_type": "lift_station", "floor": 1, "building_code": "clb"},
    {"name": "Outside nus coop store room", "lat": 1.2958464, "lon": 103.7730990, "node_type": "corner", "floor": 1, "building_code": "as6"},
    {"name": "Outside LT14", "lat": 1.2956714, "lon": 103.7732274, "node_type": "lecture theatre", "floor": 1, "building_code": "as6"},
    {"name": "Outside LT15", "lat": 1.2954475, "lon": 103.7732784, "node_type": "lecture theatre", "floor": 1, "building_code": "as6"},
    {"name": "As6 lift1", "lat": 1.2952890, "lon": 103.7733153, "node_type": "lift_station", "floor": 1, "building_code": "as6"},
    {"name": "Com1 second story outside ahu room", "lat": 1.2954026, "lon": 103.7735443, "node_type": "corner", "floor": 2, "building_code": "com1"},
    {"name": "Com1 level 2 entrance", "lat": 1.2952803, "lon": 103.7737270, "node_type": "entrance", "floor": 2, "building_code": "com1"},
    {"name": "Middle of stairs from terrace to com1", "lat": 1.2944709, "lon": 103.7741018, "node_type": "corner", "floor": 1, "building_code": "com2"},
    {"name": "Com1", "lat": 1.294946722798136, "lon": 103.77393194938502, "node_type": "building", "floor": 1, "building_code": "com1"},
    {"name": "Com2", "lat": 1.294265259902769, "lon": 103.77409799286686, "node_type": "building", "floor": 1, "building_code": "com2"},
    {"name": "Com3", "lat": 1.2947281501787837, "lon": 103.77459031912267, "node_type": "building", "floor": 1, "building_code": "com3"},
    {"name": "LT15", "lat": 1.2955214878116914, "lon": 103.77344062919603, "node_type": "lecture theatre", "floor": 1, "building_code": "as6"},
    {"name": "LT14", "lat": 1.2957011498687994, "lon": 103.77337290341598, "node_type": "lecture theatre", "floor": 1, "building_code": "as6"},
]


# ----------------------------------------------------------------------------
# accessible / sheltered network (from the 12/06 notes). Coords already known.
# floor variants of lifts get their own node so vertical edges work.
# ----------------------------------------------------------------------------
ACCESSIBLE_NODE_SPECS = [
    {"name": "Central library lift floor 4", "lat": 1.2961927, "lon": 103.7731590, "node_type": "lift_station", "floor": 4, "building_code": "clb"},
    {"name": "AS6 intersection beside staircase CLB L4", "lat": 1.2959031, "lon": 103.7730058, "node_type": "junction", "floor": 4, "building_code": "as6"},
    {"name": "As6 2nd story glassdoor", "lat": 1.2958672, "lon": 103.7731128, "node_type": "junction", "floor": 2, "building_code": "as6"},
    {"name": "As6 lift1 floor 2", "lat": 1.2952890, "lon": 103.7733153, "node_type": "lift_station", "floor": 2, "building_code": "as6"},
    {"name": "As6 ramp end road", "lat": 1.2952377, "lon": 103.7734467, "node_type": "ramp", "floor": 1, "building_code": "as6"},
    {"name": "As6 ramp to carpark", "lat": 1.2950329, "lon": 103.7732482, "node_type": "ramp", "floor": 1, "building_code": "as6"},
    {"name": "Ramp from carpark to mainroad", "lat": 1.2949858, "lon": 103.7733709, "node_type": "ramp", "floor": 1, "building_code": "road"},
    {"name": "Sheltered walkway with ramp near com1", "lat": 1.295040205814131, "lon": 103.77324977756093, "node_type": "walkway", "floor": 1, "building_code": "road"},
    {"name": "Sheltered walkway towards com1 turn 1", "lat": 1.2949826649089249, "lon": 103.77341050446702, "node_type": "walkway", "floor": 1, "building_code": "road"},
    {"name": "Sheltered walkway towards com1 turn 2", "lat": 1.2949338040984337, "lon": 103.77349752278441, "node_type": "walkway", "floor": 1, "building_code": "road"},
    {"name": "Top of staircase leading to deck", "lat": 1.2950473, "lon": 103.7730283, "node_type": "stairs", "floor": 1, "building_code": "road"},
    {"name": "Deck", "lat": 1.2946732, "lon": 103.7724432, "node_type": "canteen", "floor": 1, "building_code": "deck"},
    {"name": "Accessible ramp behind deck", "lat": 1.2945556, "lon": 103.7722679, "node_type": "ramp", "floor": 1, "building_code": "deck"},
    {"name": "Side of deck corner", "lat": 1.2947859, "lon": 103.7722971, "node_type": "corner", "floor": 1, "building_code": "deck"},
    {"name": "Main deck entrance", "lat": 1.2948945, "lon": 103.7724714, "node_type": "entrance", "floor": 1, "building_code": "deck"},
    {"name": "Carpark behind deck", "lat": 1.2945574927233388, "lon": 103.77222033453205, "node_type": "road", "floor": 1, "building_code": "road"},
    {"name": "Road to carpark behind deck turn 1", "lat": 1.2944288781263447, "lon": 103.77221518868923, "node_type": "road", "floor": 1, "building_code": "road"},
    {"name": "Road to carpark behind deck turn 2", "lat": 1.2943156973063386, "lon": 103.77236956560397, "node_type": "road", "floor": 1, "building_code": "road"},
    {"name": "Road to carpark behind deck entrance", "lat": 1.2943825768743284, "lon": 103.77271434054231, "node_type": "road", "floor": 1, "building_code": "road"},
    {"name": "Walkway along mainroad to com1 from deck", "lat": 1.294852027617188, "lon": 103.772952064899, "node_type": "walkway", "floor": 1, "building_code": "road"},
    {"name": "As8 lift", "lat": 1.2962392, "lon": 103.7722250, "node_type": "lift_station", "floor": 1, "building_code": "as8"},
    {"name": "As8/as6 junction", "lat": 1.2959869, "lon": 103.7726441, "node_type": "junction", "floor": 1, "building_code": "as8"},
]


# ----------------------------------------------------------------------------
# locations (existing). available_floors is now derived from the Floor rows,
# so it is no longer stored on Location.
# ----------------------------------------------------------------------------
LOCATION_SPECS = [
    {"name": "Central Library", "display_name": "Central Library", "aliases": ["CLB"], "location_type": "central library", "building_code": "clb", "floor": 1, "area_name": None, "lat": 1.2966200954063662, "lon": 103.77312890647435, "nearest_node_name": "Central library entrance", "nearest_bus_stop_name": "Central Library bus stop"},
    {"name": "Lecture Theatre 15", "display_name": "Lecture Theatre 15", "aliases": ["LT15", "LT 15"], "location_type": "lecture theatre", "building_code": "as6", "floor": 1, "area_name": None, "lat": 1.2955214878116914, "lon": 103.77344062919603, "nearest_node_name": "LT15", "nearest_bus_stop_name": "Central Library bus stop"},
    {"name": "Lecture Theatre 14", "display_name": "Lecture Theatre 14", "aliases": ["LT14", "LT 14"], "location_type": "lecture theatre", "building_code": "as6", "floor": 1, "area_name": None, "lat": 1.2957011498687994, "lon": 103.77337290341598, "nearest_node_name": "LT14", "nearest_bus_stop_name": "Central Library bus stop"},
    {"name": "COM1", "display_name": "COM1", "aliases": ["COM1", "Computing 1"], "location_type": "COM", "building_code": "com1", "floor": 1, "area_name": "school of computing", "lat": 1.294946722798136, "lon": 103.77393194938502, "nearest_node_name": "Com1", "nearest_bus_stop_name": "Central Library bus stop"},
    {"name": "COM2", "display_name": "COM2", "aliases": ["COM2", "Computing 2"], "location_type": "COM", "building_code": "com2", "floor": 1, "area_name": "school of computing", "lat": 1.294265259902769, "lon": 103.77409799286686, "nearest_node_name": "Com2", "nearest_bus_stop_name": "Central Library bus stop"},
    {"name": "COM3", "display_name": "COM3", "aliases": ["COM3", "Computing 3"], "location_type": "COM", "building_code": "com3", "floor": 1, "area_name": "school of computing", "lat": 1.2947281501787837, "lon": 103.77459031912267, "nearest_node_name": "Com3 MPH1", "nearest_bus_stop_name": "Central Library bus stop"},
    {"name": "Terrace", "display_name": "Terrace", "aliases": ["The Terrace"], "location_type": "canteen", "building_code": "com3", "floor": 1, "area_name": "school of computing", "lat": 1.2944054, "lon": 103.7743158, "nearest_node_name": "The Terrace", "nearest_bus_stop_name": "Central Library bus stop"},
    {"name": "Deck", "display_name": "The Deck", "aliases": ["The Deck", "Deck"], "location_type": "canteen", "building_code": "deck", "floor": 1, "area_name": "school of computing", "lat": 1.2946732, "lon": 103.7724432, "nearest_node_name": "Deck", "nearest_bus_stop_name": "Central Library bus stop"},
]


# ----------------------------------------------------------------------------
# edges. base = (from, to, mode, instruction, reverse_instruction)
# ----------------------------------------------------------------------------
BASE_EDGE_SPECS = [
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

# accessible/sheltered edges: dict form. vertical in {None,"lift","stairs"}.
ACCESSIBLE_EDGE_SPECS = [
    {"from": "Central library lift", "to": "Central library lift floor 4", "mode": "walk", "instruction": "take lift up", "reverse": "take lift down", "acc": True, "shel": True, "vertical": "lift"},
    {"from": "Central library lift floor 4", "to": "AS6 intersection beside staircase CLB L4", "mode": "walk", "instruction": "proceed forward for calculated distance", "reverse": None, "acc": True, "shel": True},
    {"from": "AS6 intersection beside staircase CLB L4", "to": "As6 2nd story glassdoor", "mode": "walk", "instruction": "proceed forward to AS6", "reverse": None, "acc": True, "shel": True},
    {"from": "As6 2nd story glassdoor", "to": "As6 lift1 floor 2", "mode": "walk", "instruction": "enter and pass through AS6", "reverse": None, "acc": True, "shel": True},
    {"from": "As6 lift1 floor 2", "to": "As6 lift1", "mode": "walk", "instruction": "take lift down to level 1", "reverse": "take lift up", "acc": True, "shel": True, "vertical": "lift"},
    {"from": "As6 lift1", "to": "As6 ramp end road", "mode": "walk", "instruction": "proceed forward, the ramp is on the left", "reverse": None, "acc": True, "shel": True},
    {"from": "As6 ramp end road", "to": "As6 ramp to carpark", "mode": "walk", "instruction": "proceed down the ramp", "reverse": None, "acc": True, "shel": False},
    {"from": "As6 ramp to carpark", "to": "Ramp from carpark to mainroad", "mode": "walk", "instruction": "proceed across the carpark", "reverse": None, "acc": True, "shel": False},
    {"from": "Ramp from carpark to mainroad", "to": "Sheltered walkway with ramp near com1", "mode": "walk", "instruction": "follow the sheltered walkway and down the ramp", "reverse": None, "acc": True, "shel": True},
    {"from": "Sheltered walkway with ramp near com1", "to": "Sheltered walkway towards com1 turn 1", "mode": "walk", "instruction": "follow the sheltered walkway to com1", "reverse": None, "acc": True, "shel": True},
    {"from": "Sheltered walkway towards com1 turn 1", "to": "Sheltered walkway towards com1 turn 2", "mode": "walk", "instruction": "follow the sheltered walkway to com1", "reverse": None, "acc": True, "shel": True},
    {"from": "Sheltered walkway towards com1 turn 2", "to": "Com1 level 1 entrance", "mode": "walk", "instruction": "follow the sheltered walkway to com1", "reverse": None, "acc": True, "shel": True},
    {"from": "Com1 level 1 entrance", "to": "Com2 entrance", "mode": "walk", "instruction": "follow the walkway to com2 entrance (not sheltered, may be tight)", "reverse": None, "acc": False, "shel": False},
    # deck branch
    {"from": "Sheltered walkway with ramp near com1", "to": "Top of staircase leading to deck", "mode": "walk", "instruction": "walk up the stairs", "reverse": "walk down the stairs", "acc": False, "shel": False},
    {"from": "Top of staircase leading to deck", "to": "Deck", "mode": "walk", "instruction": "walk straight", "reverse": None, "acc": False, "shel": False},
    {"from": "Deck", "to": "Main deck entrance", "mode": "walk", "instruction": "entrance to/from AS1 or Lecture Theatre 9", "reverse": None, "acc": True, "shel": True},
    {"from": "Main deck entrance", "to": "Side of deck corner", "mode": "walk", "instruction": "walk straight for calculated distance", "reverse": None, "acc": True, "shel": True},
    {"from": "Side of deck corner", "to": "Accessible ramp behind deck", "mode": "walk", "instruction": "walk straight for calculated distance", "reverse": None, "acc": True, "shel": True},
    {"from": "Accessible ramp behind deck", "to": "Carpark behind deck", "mode": "walk", "instruction": "take the ramp down to the carpark", "reverse": None, "acc": True, "shel": False},
    {"from": "Carpark behind deck", "to": "Road to carpark behind deck turn 1", "mode": "walk", "instruction": "follow the walkway beside the road", "reverse": None, "acc": True, "shel": False},
    {"from": "Road to carpark behind deck turn 1", "to": "Road to carpark behind deck turn 2", "mode": "walk", "instruction": "follow the walkway beside the road", "reverse": None, "acc": True, "shel": False},
    {"from": "Road to carpark behind deck turn 2", "to": "Road to carpark behind deck entrance", "mode": "walk", "instruction": "follow the walkway beside the road", "reverse": None, "acc": True, "shel": False},
    {"from": "Road to carpark behind deck entrance", "to": "Walkway along mainroad to com1 from deck", "mode": "walk", "instruction": "follow the walkway beside the main road", "reverse": None, "acc": True, "shel": False},
    {"from": "Walkway along mainroad to com1 from deck", "to": "Sheltered walkway with ramp near com1", "mode": "walk", "instruction": "follow the walkway beside the main road", "reverse": None, "acc": True, "shel": True},
    # alt: clb bus stop -> deck
    {"from": "Central Library bus stop", "to": "As8 lift", "mode": "walk", "instruction": "proceed up the ramp/stairs beside the bus stop to AS8", "reverse": None, "acc": True, "shel": True},
    {"from": "As8 lift", "to": "As8/as6 junction", "mode": "walk", "instruction": "proceed out of AS8 towards AS6", "reverse": None, "acc": True, "shel": True},
    {"from": "As8/as6 junction", "to": "AS6 intersection beside staircase CLB L4", "mode": "walk", "instruction": "proceed forward towards the AS6 staircase", "reverse": None, "acc": True, "shel": True},
]


# ----------------------------------------------------------------------------
# editor export loader (floors calibration + room nodes + edges)
# ----------------------------------------------------------------------------
def load_editor_export():
    if not MAP_DATA_JSON.exists():
        print(f"  (no {MAP_DATA_JSON} found; seeding base data only)")
        return {"floors": [], "nodes": [], "edges": []}
    data = json.loads(MAP_DATA_JSON.read_text())
    print(f"  loaded {MAP_DATA_JSON}: {len(data.get('floors', []))} floors, "
          f"{len(data.get('nodes', []))} nodes, {len(data.get('edges', []))} edges")
    return data


def editor_nodes_to_specs(data):
    specs = []
    for n in data.get("nodes", []):
        specs.append({
            "name": n["name"], "lat": n["lat"], "lon": n["lon"],
            "node_type": n.get("node_type", "room"),
            "floor": n.get("floor", 1), "building_code": n.get("building_code"),
        })
    return specs


def editor_edges_to_specs(data):
    specs = []
    for e in data.get("edges", []):
        specs.append({
            "from": e["from"], "to": e["to"], "mode": e.get("mode", "walk"),
            "instruction": e.get("instruction", ""), "reverse": e.get("reverse_instruction"),
            "acc": bool(e.get("is_accessible")), "shel": bool(e.get("is_sheltered")),
            "manual_seconds": e.get("manual_seconds"),
        })
    return specs


# ----------------------------------------------------------------------------
# builders
# ----------------------------------------------------------------------------
def dedupe_nodes(*spec_lists):
    seen, out = set(), []
    for specs in spec_lists:
        for s in specs:
            if s["name"] in seen:
                continue
            seen.add(s["name"])
            out.append(s)
    return out


def build_nodes(node_specs):
    nodes = []
    for s in node_specs:
        nodes.append(Map_Node(
            node_id=node_id_from_name(s["name"]),
            name=s["name"],
            node_type=s["node_type"],
            building_id=resolve_building_id(s.get("building_code")),
            floor=s["floor"],
            latitude=s["lat"],
            longitude=s["lon"],
        ))
    return nodes


def build_edges(edge_specs, node_by_name):
    edges = []
    for s in edge_specs:
        fn, tn = s["from"], s["to"]
        if fn not in node_by_name or tn not in node_by_name:
            raise KeyError(f"edge references missing node: {fn!r} -> {tn!r}")
        a, b = node_by_name[fn], node_by_name[tn]
        dist = haversine_m(a["lat"], a["lon"], b["lat"], b["lon"])
        dist_m = round(dist)

        if s.get("manual_seconds") is not None:
            seconds = float(s["manual_seconds"])
        elif s.get("vertical"):
            floors_crossed = max(1, abs(a["floor"] - b["floor"]))
            per = LIFT_SECONDS_PER_FLOOR if s["vertical"] == "lift" else STAIR_SECONDS_PER_FLOOR
            seconds = floors_crossed * per
        else:
            seconds = round(dist / speed_for_mode(s["mode"]), 1)

        acc = bool(s.get("acc", False))
        shel = bool(s.get("shel", False))
        instruction = s.get("instruction")
        reverse = s.get("reverse")
        reverse_text = reverse if reverse is not None else instruction

        edges.append(Map_Edge(
            edge_id=edge_id_from_names(fn, tn),
            from_node_id=node_id_from_name(fn), to_node_id=node_id_from_name(tn),
            mode=s["mode"], is_accessible=acc, is_sheltered=shel,
            distance_m=dist_m, estimated_seconds=seconds,
            instruction=format_instruction(instruction, dist_m),
            geometry=[[a["lon"], a["lat"]], [b["lon"], b["lat"]]],
        ))
        edges.append(Map_Edge(
            edge_id=edge_id_from_names(tn, fn),
            from_node_id=node_id_from_name(tn), to_node_id=node_id_from_name(fn),
            mode=s["mode"], is_accessible=acc, is_sheltered=shel,
            distance_m=dist_m, estimated_seconds=seconds,
            instruction=format_instruction(reverse_text, dist_m),
            geometry=[[b["lon"], b["lat"]], [a["lon"], a["lat"]]],
        ))
    return edges


def normalise_edge_tuple(t):
    return {"from": t[0], "to": t[1], "mode": t[2], "instruction": t[3], "reverse": t[4]}


# ----------------------------------------------------------------------------
# clear
# ----------------------------------------------------------------------------
async def clear_existing_data(session):
    await session.execute(Saved_Location.__table__.delete())
    await session.execute(Recent_Location.__table__.delete())
    await session.execute(Map_Edge.__table__.delete())
    await session.execute(Location.__table__.delete())
    await session.execute(Map_Node.__table__.delete())
    await session.execute(Floor.__table__.delete())
    await session.execute(Building.__table__.delete())
    await session.execute(User.__table__.delete())


# ----------------------------------------------------------------------------
# seed
# ----------------------------------------------------------------------------
async def seed_data(clear_first: bool = True):
    print("Loading editor export...")
    data = load_editor_export()

    async with AsyncSessionLocal() as session:
        try:
            if clear_first:
                await clear_existing_data(session)

            # 1) buildings
            buildings = [Building(**spec) for spec in BUILDING_SPECS]
            session.add_all(buildings)
            await session.flush()

            # 2) floors (from editor calibration); only for seeded buildings
            floors = []
            for f in data.get("floors", []):
                if f["building"] not in SEEDED_BUILDINGS:
                    continue
                floors.append(Floor(
                    floor_number=f["floor_number"],
                    floor_name=floor_name_for(f["floor_number"]),
                    building_id=f["building"],
                    geo_reference=f.get("geo_reference") or [],
                    image_url=f"{IMAGE_BASE_URL}/{f['image']}",
                    image_width=f["image_width"],
                    image_height=f["image_height"],
                ))
            session.add_all(floors)
            await session.flush()
            floor_id_by_key = {(fl.building_id, fl.floor_number): fl.floor_id for fl in floors}

            # 3) nodes (base + accessible + editor), de-duplicated by name
            node_specs = dedupe_nodes(
                BASE_NODE_SPECS,
                ACCESSIBLE_NODE_SPECS,
                editor_nodes_to_specs(data),
            )
            node_by_name = {s["name"]: s for s in node_specs}
            nodes = build_nodes(node_specs)
            session.add_all(nodes)

            # 4) edges (base + accessible + editor)
            edge_specs = (
                [normalise_edge_tuple(t) for t in BASE_EDGE_SPECS]
                + ACCESSIBLE_EDGE_SPECS
                + editor_edges_to_specs(data)
            )
            edges = build_edges(edge_specs, node_by_name)
            session.add_all(edges)

            # 5) locations
            locations = []
            for loc in LOCATION_SPECS:
                bid = resolve_building_id(loc["building_code"])
                fid = floor_id_by_key.get((bid, loc["floor"])) if bid else None
                locations.append(Location(
                    id=location_id_from_name(loc["name"]),
                    name=loc["name"], description="",
                    display_name=loc["display_name"], aliases=loc["aliases"],
                    location_type=loc["location_type"],
                    building_id=bid, floor_id=fid,
                    area_name=loc["area_name"], latitude=loc["lat"], longitude=loc["lon"],
                    nearest_node_id=node_id_from_name(loc["nearest_node_name"]),
                    nearest_bus_stop_id=node_id_from_name(loc["nearest_bus_stop_name"]),
                    landmark_hint=None, arrival_instruction=None,
                ))
            session.add_all(locations)

            await session.commit()

            print("Seed data inserted successfully.")
            print(f"  Buildings: {len(buildings)}")
            print(f"  Floors:    {len(floors)}")
            print(f"  Nodes:     {len(nodes)}")
            print(f"  Edges:     {len(edges)} ({len(edges)//2} bidirectional)")
            print(f"  Locations: {len(locations)}")

        except Exception:
            await session.rollback()
            print("Seed data failed. Rolled back changes.")
            raise


if __name__ == "__main__":
    asyncio.run(seed_data(clear_first=True))
