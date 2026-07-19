import asyncio
import copy
import json
import os
import re
import sys 
from math import atan2, cos, radians, sin, sqrt
from pathlib import Path
from sqlalchemy import update

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
from models.canteens import Canteen
from models.buses import Bus
from models.bus_stops import Bus_Stop
from models.bus_stop_schedule import BusStopSchedule

from poi_extras import POI_EXTRAS


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
SEEDED_BUILDINGS = {"com1", "com2", "com3", "com4", "as6", "src"}

# Floor-plan images. Point this at wherever you host them (see notes at bottom).
#   Supabase public bucket:  https://<proj>.supabase.co/storage/v1/object/public/floors
#   FastAPI StaticFiles:     /static/floors
IMAGE_BASE_URL = os.getenv(
    "FLOOR_IMAGE_BASE_URL",
    "https://dngynyaooicsuxbqnfth.supabase.co/storage/v1/object/public/floors",
).rstrip("/")

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


def floors_between(fa: int, fb: int) -> int:
    """Flights between two floors. There is no floor 0 -- basement is -1 and
    ground is 1 -- so a raw abs(fa - fb) counts B1->L1 as two flights. Collapse
    the gap by shifting negatives up one before subtracting."""
    idx = lambda f: f + 1 if f < 0 else f
    return abs(idx(fa) - idx(fb))


def resolve_building_id(code):
    """Option (b): keep building_id only for buildings we actually seed; else NULL."""
    return code if code in SEEDED_BUILDINGS else None


def floor_name_for(n: int) -> str:
    if n < 0:
        return "Basement" if n == -1 else f"Basement {abs(n)}"
    if n == 0:
        return "Ground"
    return f"Level {n}"


# ----------------------------------------------------------------------------
# building specs
# ----------------------------------------------------------------------------
BUILDING_SPECS = [
    {
        "building_id": "com1", "building_code": "com1",
        "name": "COM1", "display_name": "COM1",
        "aliases": ["COM1", "Computing 1"], "area_name": "school of computing",
        "display_latitude": 1.2952525534852652, "display_longitude": 103.77376451115138,
        # canonical routing entrance (resolved to a node id at seed time).
        "entrance_node_name": "Com1 main entrance floor 1",
    },
    {
        "building_id": "com2", "building_code": "com2",
        "name": "COM2", "display_name": "COM2",
        "aliases": ["COM2", "Computing 2"], "area_name": "school of computing",
        "display_latitude": 1.2943070185269383, "display_longitude": 103.77410604722144,
        "entrance_node_name": "Com2 entrance",
    },
    {
        "building_id": "com3", "building_code": "com3",
        "name": "COM3", "display_name": "COM3",
        "aliases": ["COM3", "Computing 3"], "area_name": "school of computing",
        "display_latitude": 1.294759386948188, "display_longitude": 103.77457751952595,
        "entrance_node_name": "node_com3_1_corridor_6",
    },
    {
        "building_id": "com4", "building_code": "com4",
        "name": "COM4", "display_name": "COM4",
        "aliases": ["COM4", "Computing 4"], "area_name": "school of computing",
        "display_latitude": 1.2951652964409013, "display_longitude": 103.77540756232389,
        # COM4's lowest seeded floor is level 2 (linked from COM3 L1 via the bridge).
        "entrance_node_name": "com4 entrance",
    },
    {
        "building_id": "as6", "building_code": "as6",
        "name": "AS6", "display_name": "AS6",
        "aliases": ["AS6", "Arts and Social Sciences 6"],
        "area_name": "faculty of arts and social sciences",
        "display_latitude": 1.295738285690793, "display_longitude": 103.77318108795896,
        "entrance_node_name": "as6_2_entrance",
    },
    {
        "building_id": "src", "building_code": "src",
        "name": "SRC", "display_name": "Stephen Riady Centre",
        "aliases": ["SRC", "Stephen Riady Centre", "UTown SRC"],
        "area_name": "utown",
        "display_latitude": 1.3045009737282307, "display_longitude": 103.77245117864669,
        # canonical routing entrance (SRC floor 2 corridor, resolved to a node id).
        "entrance_node_name": "node_src_2_corridor_22",
    },
]


# ----------------------------------------------------------------------------
# base nodes (outdoor + bus route + CLB/AS6/COM walking) -- unchanged data
# ----------------------------------------------------------------------------
BASE_NODE_SPECS = [
    # COM3 Elevator + Com3 MPH1 removed: both were redundant seed duplicates of
    # editor nodes (node_com3_1_lift and "Multipurpose Hall 1"). COM3 Elevator
    # was also badly pinned (~31 m off the real lift). The editor graph already
    # carries their connections (junction3, the com3 corridors, and the Terrace).
    {"name": "Com2 entrance", "lat": 1.2943984, "lon": 103.7739848, "node_type": "entrance", "floor": 1, "building_code": "com2"},
    {"name": "com1 level1 walkway outside entrance", "lat": 1.2948261, "lon": 103.7736496, "node_type": "walkway", "floor": 1, "building_code": None},
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
    {"name": "Outside LT14", "lat": 1.2956714, "lon": 103.7732274, "node_type": "corner", "floor": 1, "building_code": "as6"},
    {"name": "Outside LT15", "lat": 1.2954475, "lon": 103.7732784, "node_type": "corner", "floor": 1, "building_code": "as6"},
    # Coords pinned to the triangulated editor node as6_2_lift_1 (v6 re-projection)
    # so this stays correct even if align_lift_shafts() or the editor node changes.
    # (Normally align_lift_shafts() also snaps it onto that node at seed time.)
    {"name": "As6 lift1", "lat": 1.2952580, "lon": 103.7733754, "node_type": "lift_station", "floor": 1, "building_code": "as6"},
    {"name": "Middle of stairs from terrace to com1", "lat": 1.2944709, "lon": 103.7741018, "node_type": "stairs", "floor": 1, "building_code": "com2"},
    {"name": "LT15", "lat": 1.2955214878116914, "lon": 103.77344062919603, "node_type": "lecture theatre", "floor": 1, "building_code": "as6"},
    {"name": "LT14", "lat": 1.2957011498687994, "lon": 103.77337290341598, "node_type": "lecture theatre", "floor": 1, "building_code": "as6"},

    # --- D1 bus route continuation: CLB -> LT13 -> AS5 -> BIZ2 -> COM3 (new) ---
    # waypoints = "road"; stops = "bus stop". Connected in order via campus-bus edges.
    {"name": "node_bus_route_1", "lat": 1.2962975718257022, "lon": 103.77187997105706, "node_type": "road", "floor": 1, "building_code": "road"},
    {"name": "node_bus_route_2", "lat": 1.2962891645980466, "lon": 103.7709594658442, "node_type": "road", "floor": 1, "building_code": "road"},
    {"name": "node_bus_route_3", "lat": 1.2955365874629563, "lon": 103.77076489403085, "node_type": "road", "floor": 1, "building_code": "road"},
    {"name": "node_lt13_bus_stop", "lat": 1.2948554279531816, "lon": 103.7705202912168, "node_type": "bus stop", "floor": 1, "building_code": None},
    {"name": "node_bus_route_5", "lat": 1.2944242532742314, "lon": 103.77059747309964, "node_type": "road", "floor": 1, "building_code": "road"},
    {"name": "node_bus_route_6", "lat": 1.293863008912567, "lon": 103.77092441756294, "node_type": "road", "floor": 1, "building_code": "road"},
    {"name": "node_as5_bus_stop", "lat": 1.2935377422329672, "lon": 103.77143955443992, "node_type": "bus stop", "floor": 1, "building_code": None},
    {"name": "node_bus_route_8", "lat": 1.2933971876352772, "lon": 103.77219398814289, "node_type": "road", "floor": 1, "building_code": "road"},
    {"name": "node_bus_route_9", "lat": 1.2930159203391538, "lon": 103.77309553962498, "node_type": "road", "floor": 1, "building_code": "road"},
    {"name": "node_bus_route_10", "lat": 1.2923161725015877, "lon": 103.77405158936125, "node_type": "road", "floor": 1, "building_code": "road"},
    {"name": "node_bus_route_11", "lat": 1.2921758613087195, "lon": 103.77446944034396, "node_type": "road", "floor": 1, "building_code": "road"},
    {"name": "node_biz2_bus_stop", "lat": 1.2932699624029302, "lon": 103.7751024006946, "node_type": "bus stop", "floor": 1, "building_code": None},
    {"name": "node_bus_route_12", "lat": 1.2937252057128497, "lon": 103.77529188108605, "node_type": "road", "floor": 1, "building_code": "road"},
    {"name": "node_bus_route_13", "lat": 1.2937794168233852, "lon": 103.77551197053496, "node_type": "road", "floor": 1, "building_code": "road"},
    {"name": "node_com3_bus_stop", "lat": 1.2949266886505149, "lon": 103.77493269032237, "node_type": "bus stop", "floor": -2, "building_code": "com3"},

    # --- COM3 B2 stair/lift: aligned under the COM3 vertical shaft, floor -2 (new).
    # Coords copied from the COM3 stair/lift shaft so the link down to Basement 1
    # (node_com3_basement_*) is a short vertical edge, not a 75 m diagonal.
    {"name": "node_com3_b2_stairs_1", "lat": 1.2948705, "lon": 103.7748976, "node_type": "stairs", "floor": -2, "building_code": "com3"},
    {"name": "node_com3_b2_lift", "lat": 1.2948546, "lon": 103.7748752, "node_type": "lift_station", "floor": -2, "building_code": "com3"},

    # --- Computing Drive walk-up from AS5 bus stop to the Deck (new) ---
    {"name": "node_computing_dr_junction", "lat": 1.293446528052872, "lon": 103.77213965643341, "node_type": "road", "floor": 1, "building_code": "road"},
    {"name": "node_computing_dr_walk_1", "lat": 1.2939104319291714, "lon": 103.77224158037323, "node_type": "walkway", "floor": 1, "building_code": "road"},
    {"name": "node_computing_dr_walk_2", "lat": 1.294274565682006, "lon": 103.77266059731141, "node_type": "walkway", "floor": 1, "building_code": "road"},
    {"name": "Deck staircase to main road", "lat": 1.2945123, "lon": 103.7726930, "node_type": "stairs", "floor": 1, "building_code": "deck"},
]


# ----------------------------------------------------------------------------
# accessible / sheltered network (from the 12/06 notes). Coords already known.
# floor variants of lifts get their own node so vertical edges work.
# ----------------------------------------------------------------------------
ACCESSIBLE_NODE_SPECS = [
    {"name": "Central library lift floor 4", "lat": 1.2961927, "lon": 103.7731590, "node_type": "lift_station", "floor": 4, "building_code": "clb"},
    # floor is 2, not 4: this spot is AS6 level 2 and CLB level 4 at the same
    # physical height -- NUS numbers the two buildings differently. The node name
    # keeps the CLB reference because that is how it is signed on the ground, but
    # building_code is "as6", so `floor` MUST be in AS6's numbering or the node
    # would claim to sit on the AS6 L4 floor plan. Inverting the AS6 L2 affine
    # puts it at px (239, 426) on AS6_2.png -- inside the image, just west of
    # as6_2_entrance at (500, 368).
    {"name": "AS6 intersection beside staircase CLB L4", "lat": 1.2959031, "lon": 103.7730058, "node_type": "junction", "floor": 2, "building_code": "as6"},
    # "As6 2nd story glassdoor" and "As6 lift1 floor 2" removed: both are now
    # owned by the editor export as "as6_2_entrance" / "as6_2_lift_1", which are
    # pixel-bound (_px/_floorId) on the AS6 L2 floor plan. dedupe_nodes() is
    # base-first, so keeping a base spec under either name would silently win and
    # drop the editor's calibrated coords. Base edges below point at the editor
    # names instead.
    {"name": "As6 ramp to carpark", "lat": 1.2952129438832047, "lon": 103.77339530247183, "node_type": "ramp", "floor": 1, "building_code": "as6"},
    {"name": "Ramp from carpark to mainroad", "lat": 1.2951351796947648, "lon": 103.77326856810657, "node_type": "ramp", "floor": 1, "building_code": "road"},
    {"name": "Sheltered walkway with ramp near com1", "lat": 1.295054733971066, "lon": 103.7732323583118, "node_type": "walkway", "floor": 1, "building_code": "road"},
    {"name": "stairs leading to deck", "lat": 1.2951358500746721, "lon": 103.77310227113612, "node_type": "stairs", "floor": 1, "building_code": "road"},
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
    {"name": "As8 lift", "lat": 1.2960629821349776, "lon": 103.77216500528654, "node_type": "lift_station", "floor": 1, "building_code": "as8"},
    {"name": "As8/as6 junction", "lat": 1.2959869, "lon": 103.7726441, "node_type": "junction", "floor": 1, "building_code": "as8"},
]


# ----------------------------------------------------------------------------
# UTown outdoor network + Stephen Riady Centre (SRC) surroundings.
# Hand-surveyed outdoor walkway nodes plus UTown POIs. building_code is None
# (UTown is not a seeded floor-plan building). Food venues use node_type
# "canteen" and are promoted to canteen-model Locations below (stalls TBD).
# ----------------------------------------------------------------------------
UTOWN_NODE_SPECS = [
    {"name": "node_connector_to_indoor", "lat": 1.3042106171065762, "lon": 103.77330104261829, "node_type": "walkway", "floor": 1, "building_code": None},
    {"name": "node_utown_outdoor_1", "lat": 1.3042354207380586, "lon": 103.77341832653966, "node_type": "walkway", "floor": 1, "building_code": None},
    {"name": "node_utown_outdoor_2", "lat": 1.3042083622309741, "lon": 103.77374311278341, "node_type": "walkway", "floor": 1, "building_code": None},
    {"name": "node_utown_outdoor_3", "lat": 1.3040144429216554, "lon": 103.77393482688562, "node_type": "walkway", "floor": 1, "building_code": None},
    {"name": "node_utown_outdoor_4", "lat": 1.3038068930209854, "lon": 103.7740948128467, "node_type": "walkway", "floor": 1, "building_code": None},
    {"name": "node_utown_outdoor_5", "lat": 1.3051132525878306, "lon": 103.77252355452843, "node_type": "walkway", "floor": 1, "building_code": None},
    {"name": "node_utown_outdoor_6", "lat": 1.3054109005294037, "lon": 103.7727649533484, "node_type": "walkway", "floor": 1, "building_code": None},
    {"name": "node_utown_outdoor_7", "lat": 1.3051521880956103, "lon": 103.77362291172238, "node_type": "walkway", "floor": 1, "building_code": None},
    {"name": "UTown Green", "lat": 1.304875579518128, "lon": 103.77331554050443, "node_type": "walkway", "floor": 1, "building_code": None},
    {"name": "node_connector_to_src_1_stair", "lat": 1.304290382660472, "lon": 103.77332360140869, "node_type": "walkway", "floor": 1, "building_code": None},
    {"name": "UDON DON BAR", "lat": 1.3038397456214132, "lon": 103.77432351579297, "node_type": "canteen", "floor": 1, "building_code": None},
    {"name": "Hwang's", "lat": 1.3040979289025076, "lon": 103.77413405715804, "node_type": "canteen", "floor": 1, "building_code": None},
    {"name": "Jollibee NUS", "lat": 1.3043174615872135, "lon": 103.77390345599692, "node_type": "canteen", "floor": 1, "building_code": None},
    {"name": "Mr Bean", "lat": 1.3037173028461049, "lon": 103.77401760650605, "node_type": "canteen", "floor": 1, "building_code": None},
    {"name": "Makan Mala", "lat": 1.3037957371492594, "lon": 103.77390160096424, "node_type": "canteen", "floor": 1, "building_code": None},
    {"name": "The Royals Bistro", "lat": 1.3038701491769256, "lon": 103.77397066784884, "node_type": "canteen", "floor": 1, "building_code": None},
    {"name": "Fine Food", "lat": 1.3040669536031835, "lon": 103.77356910681354, "node_type": "canteen", "floor": 1, "building_code": None},
    {"name": "Starbucks", "lat": 1.3054681087669433, "lon": 103.77319054930722, "node_type": "canteen", "floor": 1, "building_code": None},
    {"name": "UTown Auditorium 1", "lat": 1.3039918941637905, "lon": 103.7733529181989, "node_type": "auditorium", "floor": 1, "building_code": None},
]


# ----------------------------------------------------------------------------
# locations (existing). available_floors is now derived from the Floor rows,
# so it is no longer stored on Location.
# ----------------------------------------------------------------------------
LOCATION_SPECS = [
    {"name": "Central Library", "display_name": "Central Library", "aliases": ["CLB"], "location_type": "central library", "building_code": "clb", "floor": 1, "area_name": None, "lat": 1.2966200954063662, "lon": 103.77312890647435, "nearest_node_name": "Central library entrance", "nearest_bus_stop_name": "Central Library bus stop"},
    {"name": "Lecture Theatre 15", "display_name": "Lecture Theatre 15", "aliases": ["LT15", "LT 15"], "location_type": "lecture theatre", "building_code": "as6", "floor": 1, "area_name": None, "lat": 1.2955214878116914, "lon": 103.77344062919603, "nearest_node_name": "LT15", "nearest_bus_stop_name": "Central Library bus stop"},
    {"name": "Lecture Theatre 14", "display_name": "Lecture Theatre 14", "aliases": ["LT14", "LT 14"], "location_type": "lecture theatre", "building_code": "as6", "floor": 1, "area_name": None, "lat": 1.2957011498687994, "lon": 103.77337290341598, "nearest_node_name": "LT14", "nearest_bus_stop_name": "Central Library bus stop"},
    {"name": "COM1", "display_name": "COM1", "aliases": ["COM1", "Computing 1"], "location_type": "building", "building_code": "com1", "floor": 1, "area_name": "school of computing", "lat": 1.294946722798136, "lon": 103.77393194938502, "nearest_node_name": "Com1 main entrance floor 1", "nearest_bus_stop_name": "Central Library bus stop"},
    {"name": "COM2", "display_name": "COM2", "aliases": ["COM2", "Computing 2"], "location_type": "building", "building_code": "com2", "floor": 1, "area_name": "school of computing", "lat": 1.294265259902769, "lon": 103.77409799286686, "nearest_node_name": "Com2 entrance", "nearest_bus_stop_name": "Central Library bus stop"},
    {"name": "COM3", "display_name": "COM3", "aliases": ["COM3", "Computing 3"], "location_type": "building", "building_code": "com3", "floor": 1, "area_name": "school of computing", "lat": 1.2947281501787837, "lon": 103.77459031912267, "nearest_node_name": "node_com3_1_corridor_6", "nearest_bus_stop_name": "Central Library bus stop"},
    {"name": "COM4", "display_name": "COM4", "aliases": ["COM4", "Computing 4"], "location_type": "building", "building_code": "com4", "floor": 2, "area_name": "school of computing", "lat": 1.2951577, "lon": 103.7753553, "nearest_node_name": "com4 entrance", "nearest_bus_stop_name": "Central Library bus stop"},
    {"name": "AS6", "display_name": "AS6", "aliases": ["AS6", "Arts and Social Sciences 6"], "location_type": "building", "building_code": "as6", "floor": 2, "area_name": "faculty of arts and social sciences", "lat": 1.295738285690793, "lon": 103.77318108795896, "nearest_node_name": "as6_2_entrance", "nearest_bus_stop_name": "Central Library bus stop"},
    {"name": "SRC", "display_name": "Stephen Riady Centre", "aliases": ["SRC", "Stephen Riady Centre", "UTown SRC"], "location_type": "building", "building_code": "src", "floor": 2, "area_name": "utown", "lat": 1.3045009737282307, "lon": 103.77245117864669, "nearest_node_name": "node_src_2_corridor_22", "nearest_bus_stop_name": "UTown bus stop"},
    {"name": "Terrace", "display_name": "Terrace", "aliases": ["The Terrace"], "location_type": "canteen", "building_code": "com2", "floor": 1, "area_name": "school of computing", "lat": 1.2944054, "lon": 103.7743158, "nearest_node_name": "The Terrace", "nearest_bus_stop_name": "Central Library bus stop"},
    {"name": "Deck", "display_name": "The Deck", "aliases": ["The Deck", "Deck"], "location_type": "canteen", "building_code": "deck", "floor": 1, "area_name": "school of computing", "lat": 1.2946732, "lon": 103.7724432, "nearest_node_name": "Deck", "nearest_bus_stop_name": "Central Library bus stop"},
    # --- UTown POIs. Restaurants/cafes grouped under the canteen model per request. ---
    {"name": "UDON DON BAR", "display_name": "UDON DON BAR", "aliases": ["Udon Don Bar"], "location_type": "canteen", "building_code": None, "floor": 1, "area_name": "utown", "lat": 1.3038397456214132, "lon": 103.77432351579297, "nearest_node_name": "UDON DON BAR", "nearest_bus_stop_name": "UTown bus stop"},
    {"name": "Hwang's", "display_name": "Hwang's", "aliases": ["Hwangs"], "location_type": "canteen", "building_code": None, "floor": 1, "area_name": "utown", "lat": 1.3040979289025076, "lon": 103.77413405715804, "nearest_node_name": "Hwang's", "nearest_bus_stop_name": "UTown bus stop"},
    {"name": "Jollibee NUS", "display_name": "Jollibee NUS", "aliases": ["Jollibee"], "location_type": "canteen", "building_code": None, "floor": 1, "area_name": "utown", "lat": 1.3043174615872135, "lon": 103.77390345599692, "nearest_node_name": "Jollibee NUS", "nearest_bus_stop_name": "UTown bus stop"},
    {"name": "Mr Bean", "display_name": "Mr Bean", "aliases": ["Mr. Bean"], "location_type": "canteen", "building_code": None, "floor": 1, "area_name": "utown", "lat": 1.3037173028461049, "lon": 103.77401760650605, "nearest_node_name": "Mr Bean", "nearest_bus_stop_name": "UTown bus stop"},
    {"name": "Makan Mala", "display_name": "Makan Mala", "aliases": [], "location_type": "canteen", "building_code": None, "floor": 1, "area_name": "utown", "lat": 1.3037957371492594, "lon": 103.77390160096424, "nearest_node_name": "Makan Mala", "nearest_bus_stop_name": "UTown bus stop"},
    {"name": "The Royals Bistro", "display_name": "The Royals Bistro", "aliases": ["Royals Bistro"], "location_type": "canteen", "building_code": None, "floor": 1, "area_name": "utown", "lat": 1.3038701491769256, "lon": 103.77397066784884, "nearest_node_name": "The Royals Bistro", "nearest_bus_stop_name": "UTown bus stop"},
    {"name": "Fine Food", "display_name": "Fine Food", "aliases": [], "location_type": "canteen", "building_code": None, "floor": 1, "area_name": "utown", "lat": 1.3040669536031835, "lon": 103.77356910681354, "nearest_node_name": "Fine Food", "nearest_bus_stop_name": "UTown bus stop"},
    {"name": "Starbucks", "display_name": "Starbucks", "aliases": ["Starbucks UTown"], "location_type": "canteen", "building_code": None, "floor": 1, "area_name": "utown", "lat": 1.3054681087669433, "lon": 103.77319054930722, "nearest_node_name": "Starbucks", "nearest_bus_stop_name": "UTown bus stop"},
    {"name": "UTown Auditorium 1", "display_name": "UTown Auditorium 1", "aliases": ["UTown Auditorium", "Auditorium 1"], "location_type": "auditorium", "building_code": None, "floor": 1, "area_name": "utown", "lat": 1.3039918941637905, "lon": 103.7733529181989, "nearest_node_name": "UTown Auditorium 1", "nearest_bus_stop_name": "UTown bus stop"},
    # Flavours@UTown: SRC L2 food court promoted from an editor "room" node to a
    # curated canteen. nearest_node_name matches the editor node so the auto-promo
    # step skips it (no duplicate Location); stalls live in POI_EXTRAS.
    {"name": "Flavours@UTown", "display_name": "Flavours@UTown", "aliases": ["Flavours", "Flavours UTown"], "location_type": "canteen", "building_code": "src", "floor": 2, "area_name": "utown", "lat": 1.3046801, "lon": 103.7728292, "nearest_node_name": "Flavours@UTown", "nearest_bus_stop_name": "UTown bus stop"},
    # SRC L1 food outlets: promoted from editor "room" nodes to curated canteens.
    {"name": "Waa Cow!", "display_name": "Waa Cow!", "aliases": ["Waa Cow"], "location_type": "canteen", "building_code": "src", "floor": 1, "area_name": "utown", "lat": 1.3047322, "lon": 103.7725574, "nearest_node_name": "Waa Cow!", "nearest_bus_stop_name": "UTown bus stop"},
    {"name": "Subway", "display_name": "Subway", "aliases": ["Subway UTown"], "location_type": "canteen", "building_code": "src", "floor": 1, "area_name": "utown", "lat": 1.3045117, "lon": 103.7728712, "nearest_node_name": "Subway", "nearest_bus_stop_name": "UTown bus stop"},
    {"name": "Super Snacks", "display_name": "Super Snacks", "aliases": [], "location_type": "canteen", "building_code": "src", "floor": 1, "area_name": "utown", "lat": 1.304783, "lon": 103.7727716, "nearest_node_name": "Super Snacks", "nearest_bus_stop_name": "UTown bus stop"},
    {"name": "Sapore", "display_name": "Sapore", "aliases": [], "location_type": "canteen", "building_code": "src", "floor": 1, "area_name": "utown", "lat": 1.3045982, "lon": 103.7729762, "nearest_node_name": "Sapore", "nearest_bus_stop_name": "UTown bus stop"},
    # UTown Green: searchable open-space landmark, anchored on its walkway node.
    {"name": "UTown Green", "display_name": "UTown Green", "aliases": ["Town Green", "UTown Field"], "location_type": "field", "building_code": None, "floor": 1, "area_name": "utown", "lat": 1.304875579518128, "lon": 103.77331554050443, "nearest_node_name": "UTown Green", "nearest_bus_stop_name": "UTown bus stop"},
]


# ----------------------------------------------------------------------------
# edges. base = (from, to, mode, instruction, reverse_instruction, acc, sheltered)
# ----------------------------------------------------------------------------
BASE_EDGE_SPECS = [
    ("The Terrace", "Com2 entrance", "walk", "walk straight for calculated distance", None, True, True),
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
    # --- D1 continuation: Central Library -> LT13 -> AS5 -> BIZ2 -> COM3 (new) ---
    ("Central Library bus stop", "node_bus_route_1", "campus bus", "continue from Central Library towards LT13", "arriving at Central Library bus stop"),
    ("node_bus_route_1", "node_bus_route_2", "campus bus", "", None),
    ("node_bus_route_2", "node_bus_route_3", "campus bus", "", None),
    ("node_bus_route_3", "node_lt13_bus_stop", "campus bus", "arriving at LT13 bus stop", "departing LT13 bus stop"),
    ("node_lt13_bus_stop", "node_bus_route_5", "campus bus", "", None),
    ("node_bus_route_5", "node_bus_route_6", "campus bus", "", None),
    ("node_bus_route_6", "node_as5_bus_stop", "campus bus", "arriving at AS5 bus stop", "departing AS5 bus stop"),
    ("node_as5_bus_stop", "node_bus_route_8", "campus bus", "", None),
    ("node_bus_route_8", "node_bus_route_9", "campus bus", "", None),
    ("node_bus_route_9", "node_bus_route_10", "campus bus", "", None),
    ("node_bus_route_10", "node_bus_route_11", "campus bus", "", None),
    ("node_bus_route_11", "node_biz2_bus_stop", "campus bus", "arriving at BIZ2 bus stop", "departing BIZ2 bus stop"),
    ("node_biz2_bus_stop", "node_bus_route_12", "campus bus", "", None),
    ("node_bus_route_12", "node_bus_route_13", "campus bus", "", None),
    ("node_bus_route_13", "node_com3_bus_stop", "campus bus", "arriving at COM3 bus stop", "departing COM3 bus stop"),
    ("Central library stairs", "Central library entrance", "walk", "walk straight for calculated distance", None, False, True),
    ("Central library entrance", "Central library lift", "walk", "walk straight for calculated distance", None, True, True),
    ("Outside nus coop store room", "Outside LT14", "walk", "walk straight for calculated distance", None, True, True),
    ("Outside LT14", "Outside LT15", "walk", "walk straight for calculated distance", None, True, True),
    ("Outside LT15", "As6 lift1", "walk", "walk straight for calculated distance", None, True, True),
    # AS6 -> COM1 floor 2 bridge. The old "Com1 second story outside ahu room"
    # waypoint was dropped: it sat on a straight run (As6 lift1 -> ahu -> corr17
    # are all ~57-64 deg), so it added no geometry. Turns are now generated from
    # the real junctions -- left at As6 lift1 (from the LT15 approach), right at
    # corr17 (toward corr15) -- so no manual instruction is needed here.
    # NOTE: editor node is "corr17 com1 floor 2" (space before 2), unlike the
    # other corrN nodes which are "corrN com1 floor2" -- must match exactly or
    # build_edges() raises KeyError.
    ("As6 lift1", "corr17 com1 floor 2", "walk", "", None, False, True),
    # corr13 <-> corr16 (floor 2) now lives in the editor export, so it is NOT a
    # base edge here -- duplicating it would collide on edge_id (build_edges has
    # no edge dedup). That link is what joins the corr14-17 cluster to the
    # corr1-13/18 cluster holding "main entrance to com1 floor2".
    # NOTE: the old "corr1 com2 floor1" <-> "Middle of stairs from terrace to com1"
    # edge was removed -- node_com2_1_stairs_connector now joins those two (editor
    # edge connector->corr1 com2 floor1, plus the seed edge Middle-of-stairs->connector).
    ("Outside LT14", "LT14", "walk", "walk down stairs or ramp and straight for calculated distance", None, True, True),
    ("Outside LT15", "LT15", "walk", "walk down stairs or ramp and straight for calculated distance", None, True, True),
]

# accessible/sheltered edges: dict form. vertical in {None,"lift","stairs"}.
ACCESSIBLE_EDGE_SPECS = [
    # stair edges relocated from BASE_EDGE_SPECS: the tuple form cannot carry
    # "vertical", so anything with stairs in it has to live here.
    {"from": "Central Library bus stop", "to": "Central library stairs", "mode": "walk", "instruction": "walk down the stairs", "reverse": "walk up the stairs", "acc": False, "shel": True, "vertical": "stairs"},
    {"from": "Central library lift", "to": "Outside nus coop store room", "mode": "walk", "instruction": "walk up stairs", "reverse": "walk down stairs", "acc": False, "shel": True, "vertical": "stairs"},
    # Terrace stair landing split via the com2/com3 stairs connectors. The old
    # single "Middle of stairs -> The Terrace" edge is replaced by: the stairs
    # segment down to the com2 connector (not accessible), then step-free hops
    # from that connector to The Terrace and across to the com3 connector.
    {"from": "Middle of stairs from terrace to com1", "to": "node_com2_1_stairs_connector", "mode": "walk", "instruction": "walk down the stairs to the landing", "reverse": "walk up the stairs", "acc": False, "shel": True, "vertical": "stairs"},
    {"from": "node_com2_1_stairs_connector", "to": "The Terrace", "mode": "walk", "instruction": "walk straight for calculated distance", "reverse": None, "acc": True, "shel": True},
    {"from": "node_com2_1_stairs_connector", "to": "node_com3_1_stairs_connector", "mode": "walk", "instruction": "walk straight for calculated distance", "reverse": None, "acc": True, "shel": True},
    {"from": "Central library lift", "to": "Central library lift floor 4", "mode": "walk", "instruction": "take lift up", "reverse": "take lift down", "acc": True, "shel": True, "vertical": "lift"},
    {"from": "Central library lift floor 4", "to": "AS6 intersection beside staircase CLB L4", "mode": "walk", "instruction": "proceed forward for calculated distance", "reverse": None, "acc": True, "shel": True},
    # bridge edges into the AS6 editor graph. Endpoints are editor nodes, so these
    # MUST live here (base node on one side) rather than in the editor JSON.
    {"from": "AS6 intersection beside staircase CLB L4", "to": "as6_2_entrance", "mode": "walk", "instruction": "proceed forward to AS6", "reverse": None, "acc": True, "shel": True},
    # NOTE: the old "As6 2nd story glassdoor" -> "As6 lift1 floor 2" hop is gone.
    # It was a 67 m straight-line teleport across the building that undercut the
    # real L2 corridor chain (entrance -> corr_1 -> corr_2 -> corr_3 -> lift_1,
    # 69 m, fully accessible). The corridor chain now carries that traffic.
    {"from": "as6_2_lift_1", "to": "As6 lift1", "mode": "walk", "instruction": "take lift down to level 1", "reverse": "take lift up", "acc": True, "shel": True, "vertical": "lift"},
    {"from": "As6 lift1", "to": "As6 ramp to carpark", "mode": "walk", "instruction": "proceed forward and down the ramp", "reverse": None, "acc": True, "shel": True},
    {"from": "As6 ramp to carpark", "to": "Ramp from carpark to mainroad", "mode": "walk", "instruction": "proceed across the carpark", "reverse": None, "acc": True, "shel": False},
    {"from": "Ramp from carpark to mainroad", "to": "Sheltered walkway with ramp near com1", "mode": "walk", "instruction": "follow the sheltered walkway and down the ramp", "reverse": None, "acc": True, "shel": True},
    {"from": "Sheltered walkway with ramp near com1", "to": "Sheltered walkway towards com1 turn 1", "mode": "walk", "instruction": "follow the sheltered walkway to com1", "reverse": None, "acc": True, "shel": True},
    {"from": "Sheltered walkway towards com1 turn 1", "to": "Sheltered walkway towards com1 turn 2", "mode": "walk", "instruction": "follow the sheltered walkway to com1", "reverse": None, "acc": True, "shel": True},
    {"from": "Sheltered walkway towards com1 turn 2", "to": "com1 level1 walkway outside entrance", "mode": "walk", "instruction": "follow the sheltered walkway to com1", "reverse": None, "acc": True, "shel": True},
    {"from": "com1 level1 walkway outside entrance", "to": "Com2 entrance", "mode": "walk", "instruction": "follow the walkway to com2 entrance (step-free, may be tight)", "reverse": None, "acc": True, "shel": False},
    # deck branch
    {"from": "Sheltered walkway with ramp near com1", "to": "stairs leading to deck", "mode": "walk", "instruction": "walk up the stairs towards the deck", "reverse": "walk down the stairs", "acc": False, "shel": False, "vertical": "stairs"},
    {"from": "stairs leading to deck", "to": "Top of staircase leading to deck", "mode": "walk", "instruction": "continue up to the top of the staircase", "reverse": "walk down the stairs", "acc": False, "shel": False, "vertical": "stairs"},
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
    # --- SRC (Stephen Riady Centre) vertical links -------------------------------
    # The editor export has SRC floors 1 & 2 but NO vertical edges, so the two
    # floors are disconnected islands. These connect them via the two lifts and
    # the stairwell. Kept in the seed (not the JSON) so they survive re-exports;
    # if you later add them in the editor, delete these to avoid edge_id clashes.
    # NOTE: node_src_1_stairs_1 <-> node_src_2_stairs_1 endpoints are 20.9 m apart
    # horizontally -- the L2 stair node looks mis-pinned; verify before trusting.
    {"from": "node_src_1_lift_1",   "to": "node_src_2_lift_1",   "mode": "walk", "instruction": "", "reverse": None, "acc": True,  "shel": True, "vertical": "lift"},
    {"from": "node_src_1_lift_2",   "to": "node_src_2_lift_2",   "mode": "walk", "instruction": "", "reverse": None, "acc": True,  "shel": True, "vertical": "lift"},
    {"from": "node_src_1_stairs_1", "to": "node_src_2_stairs_1", "mode": "walk", "instruction": "", "reverse": None, "acc": False, "shel": True, "vertical": "stairs"},
    # SRC L1 interior -> outdoor plaza connector via the L1 stairs. Marked vertical
    # stairs + acc=False so it carries a real level change: this is what stops
    # node_connector_to_indoor from flatly bridging SRC L1 (corridor_19) and L2
    # (corridor_22). Accessible routes must instead use the SRC lift.
    {"from": "node_src_1_corridor_19", "to": "node_connector_to_src_1_stair", "mode": "walk", "instruction": "walk up the stairs towards the plaza", "reverse": "walk down the stairs into SRC Level 1", "acc": False, "shel": True, "vertical": "stairs"},

    # --- COM3 bus stop -> COM3 Basement 1 via the B2 stair/lift shaft (new) ---
    # b2 nodes sit under the COM3 shaft (floor -2); these two are short vertical hops
    # down to Basement 1. The bus-stop links below are ~76 m surface spans (the COM3
    # bus stop is 76 m from the shaft) -- see notes; may want to route via the L1 shaft.
    {"from": "node_com3_b2_stairs_1", "to": "node_com3_basement_stairs_1", "mode": "walk", "instruction": "walk up the stairs", "reverse": "walk down the stairs", "acc": False, "shel": True, "vertical": "stairs"},
    {"from": "node_com3_b2_lift", "to": "node_com3_basement_lift", "mode": "walk", "instruction": "take the lift", "reverse": "take the lift", "acc": True, "shel": True, "vertical": "lift"},
    {"from": "node_com3_b2_stairs_1", "to": "node_com3_bus_stop", "mode": "walk", "instruction": "proceed to the COM3 bus stop", "reverse": None, "acc": True, "shel": True},
    {"from": "node_com3_b2_lift", "to": "node_com3_bus_stop", "mode": "walk", "instruction": "proceed to the COM3 bus stop", "reverse": None, "acc": True, "shel": True},

    # --- AS5 bus stop -> Computing Drive -> up the staircase to the Deck (new) ---
    # walk_2 joins the existing carpark road AT its node ("Road to carpark behind deck
    # entrance", ~15 m away) instead of slicing across it, then follows to the staircase
    # foot and up to the Deck (33 m).
    {"from": "node_as5_bus_stop", "to": "node_computing_dr_junction", "mode": "walk", "instruction": "follow Computing Drive", "reverse": None, "acc": True, "shel": False},
    {"from": "node_computing_dr_junction", "to": "node_computing_dr_walk_1", "mode": "walk", "instruction": "follow Computing Drive towards the Deck", "reverse": None, "acc": True, "shel": False},
    {"from": "node_computing_dr_walk_1", "to": "node_computing_dr_walk_2", "mode": "walk", "instruction": "continue along Computing Drive", "reverse": None, "acc": True, "shel": False},
    {"from": "node_computing_dr_walk_2", "to": "Road to carpark behind deck entrance", "mode": "walk", "instruction": "join the carpark road", "reverse": None, "acc": True, "shel": False},
    {"from": "Road to carpark behind deck entrance", "to": "Deck staircase to main road", "mode": "walk", "instruction": "reach the foot of the deck staircase", "reverse": None, "acc": True, "shel": False},
    {"from": "Deck staircase to main road", "to": "Deck", "mode": "walk", "instruction": "walk up the staircase to the Deck", "reverse": "walk down the staircase to the main road", "acc": False, "shel": False, "vertical": "stairs"},
]


# ----------------------------------------------------------------------------
# UTown outdoor walking edges: SRC corridors <-> outdoor network <-> POIs and the
# UTown bus stop (which reconnects SRC to campus via the bus route). Tuple form:
# (from, to, mode, instruction, reverse, acc, sheltered). acc=True/shel=False are
# provisional defaults for the outdoor paths -- refine when the network is firmed up.
# ----------------------------------------------------------------------------
UTOWN_EDGE_SPECS = [
    ("node_src_1_corridor_8", "node_utown_outdoor_5", "walk", "", None, True, False),
    ("node_utown_outdoor_5", "node_utown_outdoor_6", "walk", "", None, True, False),
    ("node_utown_outdoor_6", "Starbucks", "walk", "", None, True, False),
    # SRC L1 no longer connects flat to the outdoor connector -- it now reaches it
    # via node_connector_to_src_1_stair through a STAIRS edge (see ACCESSIBLE_EDGE_SPECS),
    # so L1<->L2 can't be crossed flat through node_connector_to_indoor.
    ("node_src_2_corridor_22", "node_connector_to_indoor", "walk", "", None, True, False),
    ("node_connector_to_indoor", "node_utown_outdoor_1", "walk", "", None, True, False),
    ("node_utown_outdoor_1", "UTown Auditorium 1", "walk", "", None, True, False),
    ("node_utown_outdoor_1", "node_utown_outdoor_2", "walk", "", None, True, False),
    ("node_utown_outdoor_2", "Jollibee NUS", "walk", "", None, True, False),
    ("node_utown_outdoor_2", "Fine Food", "walk", "", None, True, False),
    ("node_utown_outdoor_2", "node_utown_outdoor_3", "walk", "", None, True, False),
    ("node_utown_outdoor_3", "Hwang's", "walk", "", None, True, False),
    ("node_utown_outdoor_3", "The Royals Bistro", "walk", "", None, True, False),
    ("node_utown_outdoor_3", "node_utown_outdoor_4", "walk", "", None, True, False),
    ("node_utown_outdoor_4", "UDON DON BAR", "walk", "", None, True, False),
    ("node_utown_outdoor_4", "Makan Mala", "walk", "", None, True, False),
    ("node_utown_outdoor_4", "Mr Bean", "walk", "", None, True, False),
    ("node_utown_outdoor_4", "UTown bus stop", "walk", "", None, True, False),
    # --- UTown Green / Starbucks <-> Jollibee link (new) ---
    ("Starbucks", "node_utown_outdoor_7", "walk", "", None, True, True),
    ("node_utown_outdoor_7", "Jollibee NUS", "walk", "", None, True, True),
    ("node_utown_outdoor_7", "UTown Green", "walk", "", None, True, False),
    ("node_connector_to_src_1_stair", "UTown Green", "walk", "", None, True, False),
    # link the connector into the SRC/indoor network (node_connector_to_indoor ~9 m)
    # so it's a real through-route, not a dead-end spur off UTown Green.
    ("node_connector_to_src_1_stair", "node_connector_to_indoor", "walk", "", None, True, False),
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
            "aliases": n.get("aliases") or [],
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
            "vertical": e.get("vertical"),
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
            if s["vertical"] == "lift":
                floors_crossed = max(1, floors_between(a["floor"], b["floor"]))
                seconds = floors_crossed * LIFT_SECONDS_PER_FLOOR
            else:
                flights = s.get("flights", max(1, floors_between(a["floor"], b["floor"])))
                seconds = round(dist / WALK_SPEED_MPS + flights * STAIR_SECONDS_PER_FLOOR, 1)
        else:
            seconds = round(dist / speed_for_mode(s["mode"]), 1)

        acc = bool(s.get("acc", False))
        shel = bool(s.get("shel", False))
        # campus bus segments are always wheelchair-accessible + sheltered (ISB
        # fleet boards step-free and runs covered routes), regardless of how the
        # tuple was written. Applied here so new bus edges inherit it for free.
        if s["mode"] == "campus bus":
            acc = True
            shel = True
        # Manual per-edge instructions are stripped: turn-by-turn text is now
        # generated at request time by build_instructions() in routing_service,
        # from node geometry + edge mode/vertical. Both directions seed NULL so
        # nothing stale lingers in the DB. (Any instruction/reverse text still in
        # the specs or editor export is ignored.)
        edges.append(Map_Edge(
            edge_id=edge_id_from_names(fn, tn),
            from_node_id=node_id_from_name(fn), to_node_id=node_id_from_name(tn),
            mode=s["mode"], is_accessible=acc, is_sheltered=shel,
            distance_m=dist_m, estimated_seconds=seconds,
            vertical=s.get("vertical"),
            instruction=None,
            geometry=[[a["lon"], a["lat"]], [b["lon"], b["lat"]]],
        ))
        edges.append(Map_Edge(
            edge_id=edge_id_from_names(tn, fn),
            from_node_id=node_id_from_name(tn), to_node_id=node_id_from_name(fn),
            mode=s["mode"], is_accessible=acc, is_sheltered=shel,
            distance_m=dist_m, estimated_seconds=seconds,
            vertical=s.get("vertical"),
            instruction=None,
            geometry=[[b["lon"], b["lat"]], [a["lon"], a["lat"]]],
        ))
    return edges


def align_lift_shafts(node_by_name, edge_specs, trusted_names=frozenset()):
    """Snap every lift shaft's floor nodes onto a single trusted coordinate.

    A lift is physically vertical, so all of its floor nodes must share one
    lat/lon. Positions drift a few metres per floor, which makes the vertical
    edge (and anything hanging off it) draw an out-and-back spike on the map.
    Nodes are grouped into shafts by chains of vertical=="lift" edges
    (union-find), then every node in a shaft is moved onto one anchor node.

    Anchor selection, in order of preference:
      1. Prefer nodes in `trusted_names` (the triangulated editor export) over
         on-foot surveyed seed nodes, which are less accurate.
      2. Among the preferred set, use the LOWEST floor.
    So a shaft that mixes an editor node with an iffy seed node (e.g. AS6:
    seed floor 1 + editor floor 2) anchors on the editor node, not the lowest
    floor. An all-seed shaft (e.g. CLB) falls back to lowest floor.

    Mutates the shared node spec dicts, so it MUST run before
    build_nodes()/build_edges(). Returns the number of nodes moved.
    """
    parent = {}

    def find(x):
        parent.setdefault(x, x)
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(a, b):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb

    lift_nodes = set()
    for s in edge_specs:
        if s.get("vertical") == "lift":
            a, b = s["from"], s["to"]
            if a in node_by_name and b in node_by_name:
                union(a, b)
                lift_nodes.add(a)
                lift_nodes.add(b)

    shafts = {}
    for n in lift_nodes:
        shafts.setdefault(find(n), []).append(n)

    moved = 0
    for members in shafts.values():
        trusted = [n for n in members if n in trusted_names] or members
        anchor = min(trusted, key=lambda n: node_by_name[n]["floor"])
        lat, lon = node_by_name[anchor]["lat"], node_by_name[anchor]["lon"]
        for n in members:
            nd = node_by_name[n]
            if nd["lat"] != lat or nd["lon"] != lon:
                nd["lat"], nd["lon"] = lat, lon
                moved += 1
    return moved


def normalise_edge_tuple(t):
    # base tuple is (from, to, mode, instruction, reverse) with two OPTIONAL
    # trailing flags: (..., acc, shel). Absent -> False (back-compatible).
    return {
        "from": t[0], "to": t[1], "mode": t[2],
        "instruction": t[3], "reverse": t[4],
        "acc": bool(t[5]) if len(t) > 5 else False,
        "shel": bool(t[6]) if len(t) > 6 else False,
    }


# ----------------------------------------------------------------------------
# clear
# ----------------------------------------------------------------------------
# ----------------------------------------------------------------------------
# bus specs
# ----------------------------------------------------------------------------
# Milestone 2: only stops that have a graph node are seeded (the list endpoint
# filters node_id IS NOT NULL, so nodeless stops would be hidden anyway).
# Each stop ties to its Map_Node by name -> node_id_from_name().
BUS_STOP_SPECS = [
    {"bus_stop_id": "clb_bus_stop",   "name": "Central Library", "node_name": "Central Library bus stop"},
    {"bus_stop_id": "utown_bus_stop", "name": "University Town",  "node_name": "UTown bus stop"},
    # D1 continuation stops (new)
    {"bus_stop_id": "lt13_bus_stop",  "name": "LT13",  "node_name": "node_lt13_bus_stop"},
    {"bus_stop_id": "as5_bus_stop",   "name": "AS5",   "node_name": "node_as5_bus_stop"},
    {"bus_stop_id": "biz2_bus_stop",  "name": "BIZ2",  "node_name": "node_biz2_bus_stop"},
    {"bus_stop_id": "com3_bus_stop",  "name": "COM3",  "node_name": "node_com3_bus_stop"},
]

# buses (bus_number is a string: "A1", "D1", ...)
BUS_SPECS = [
    {"bus_number": "D1"},
]

# (bus_number, bus_stop_id, interval_minutes) — the mock schedule links.
BUS_STOP_SCHEDULE_SPECS = [
    ("D1", "clb_bus_stop",   10),
    ("D1", "utown_bus_stop", 10),
    ("D1", "lt13_bus_stop",  10),
    ("D1", "as5_bus_stop",   10),
    ("D1", "biz2_bus_stop",  10),
    ("D1", "com3_bus_stop",  10),
]


# ----------------------------------------------------------------------------
# indoor room locations (generated from editor-export nodes)
# ----------------------------------------------------------------------------
# Destination node_types become searchable Location rows; corridors/stairs/
# junctions/ahu/lifts stay pure routing nodes. name = cleaned display name,
# aliases = name + expansions, nearest_node_id = the room's OWN node (which is
# built from the ORIGINAL node name, so we resolve it via the raw name).
INDOOR_DEST_TYPES = {
    "room", "lab", "seminar room", "discussion room",
    "tutorial room", "lecture theatre",
}

_INDOOR_PREFIX = {
    "SR": "Seminar Room", "PL": "Programming Lab", "TR": "Tutorial Room",
    "DR": "Discussion Room", "LT": "Lecture Theatre",
}
_INDOOR_CODED = re.compile(r"^([A-Za-z]+)\s*(\d+)$")

# original node name -> (display_name, [extra aliases]); fixes typos, long names,
# and casing. Keys must match the RAW node name (incl. any trailing space).
_INDOOR_OVERRIDES = {
    "Embeded systems Teaching Lab1": ("Embedded Systems Teaching Lab 1", []),
    "Embeded systems Teaching Lab2": ("Embedded Systems Teaching Lab 2", []),
    "Data Communication and networking lab/ parallel and distributed computing lab":
        ("Data Comms & Networking Lab",
         ["Parallel and Distributed Computing Lab",
          "Data Communication and networking lab/ parallel and distributed computing lab"]),
    "Information systems and anayltics research 4: ISA Lab4":
        ("ISA Lab4", ["Information Systems and Analytics Research 4"]),
    "SR @ LT19": ("SR @ LT19", ["Seminar Room @lt19"]),
    "AI 1": ("AI 1", ["Artificial Intelligence 1"]),
    "Database1": ("Database 1", []),
    "Technical room1": ("Technical Room 1", []),
    "technical room2": ("Technical Room 2", []),
    "tech hangout": ("Tech Hangout", []),
    "supplies room": ("Supplies Room", []),
    "supplies room 2": ("Supplies Room 2", []),
    "Computational biology 2": ("Computational Biology 2", []),
    "Graduate students lounge": ("Graduate Students Lounge", []),
    "Students lounge": ("Students Lounge", []),
    "Undergraduate studies": ("Undergraduate Studies", []),
    "Career consultation room": ("Career Consultation Room", []),
    "Robot Living studio": ("Robot Living Studio", []),
    "Robot experiment lab": ("Robot Experiment Lab", []),
    "Active learning lab": ("Active Learning Lab", []),
    "Research equipment room": ("Research Equipment Room", []),
    "Innovation and entrepreneurship": ("Innovation and Entrepreneurship", []),
    "former information systems 1": ("Former Information Systems 1", []),
    "former information systems 2": ("Former Information Systems 2", []),
    "Computer room1": ("Computer Room 1", []),
    "AV control room": ("AV Control Room", []),
    "IT security & OS Lab": ("IT Security & OS Lab", []),
    "E&A cluster ": ("E&A Cluster", []),     # NOTE: trailing space in source
    "E&A cluster 2": ("E&A Cluster 2", []),
    "E&A cluster 3": ("E&A Cluster 3", []),
    "E&A cluster 4": ("E&A Cluster 4", []),
    "Executive classroom 04-02": ("Executive Classroom 04-02", []),
    "Multipurpose space 04-01": ("Multipurpose Space 04-01", []),
}


def _indoor_name_aliases(raw_name):
    if raw_name in _INDOOR_OVERRIDES:
        disp, extra = _INDOOR_OVERRIDES[raw_name]
        return disp, [disp] + extra
    m = _INDOOR_CODED.match(raw_name.strip())
    if m and m.group(1).upper() in _INDOOR_PREFIX:
        disp = raw_name.strip()
        return disp, [disp, f"{_INDOOR_PREFIX[m.group(1).upper()]} {m.group(2)}"]
    disp = raw_name.strip()
    return disp, [disp]


def build_location_specs(node_specs):
    """Single source of truth for every searchable Location row.

    - Curated LOCATION_SPECS are authoritative.
    - A destination node (node_type in INDOOR_DEST_TYPES) is auto-promoted to a
      Location ONLY if no curated row already represents that node.
    - Raises on any collision (duplicate id, or two specs claiming one node) so
      problems surface in the dry-run, never silently at search time.
    """
    specs, seen_ids, claimed_nodes = [], set(), set()

    def emit(spec, anchor_node):
        # drop any alias that just repeats the display name (case-insensitive)
        # so aliases never duplicate what's already shown as the display_name.
        dn = (spec.get("display_name") or "").strip().lower()
        spec["aliases"] = [a for a in spec["aliases"] if a.strip().lower() != dn]
        loc_id = location_id_from_name(spec["name"])
        if loc_id in seen_ids:
            raise ValueError(f"duplicate Location id {loc_id!r} (name {spec['name']!r})")
        if anchor_node is not None:
            if anchor_node in claimed_nodes:
                raise ValueError(
                    f"node {anchor_node!r} already mapped to a Location; "
                    f"{spec['name']!r} would duplicate it"
                )
            claimed_nodes.add(anchor_node)
        seen_ids.add(loc_id)
        specs.append(spec)

    # 1) curated rows win. only destination-typed rows CLAIM their node, so
    #    POIs/buildings that merely share a routing node don't block each other.
    for loc in LOCATION_SPECS:
        anchor = loc["nearest_node_name"] if loc["location_type"] in INDOOR_DEST_TYPES else None
        emit({
            "name": loc["name"], "display_name": loc["display_name"],
            "aliases": loc["aliases"], "location_type": loc["location_type"],
            "building_code": loc["building_code"], "floor": loc["floor"],
            "lat": loc["lat"], "lon": loc["lon"], "area_name": loc["area_name"],
            "nearest_node_name": loc["nearest_node_name"],
            "nearest_bus_stop_name": loc["nearest_bus_stop_name"],
        }, anchor)

    # 2) auto-promote leftover destination nodes (the bulk editor rooms)
    curated_names = {loc["name"] for loc in LOCATION_SPECS}
    for n in node_specs:
        if n.get("node_type") not in INDOOR_DEST_TYPES:
            continue
        if n["name"] in claimed_nodes:        # a curated row already covers it
            continue
        if n["name"] in curated_names:       # editor node duplicates a curated Location -> skip
            continue
        disp, aliases = _indoor_name_aliases(n["name"])
        merged = list(aliases)
        for a in (n.get("aliases") or []):
            if a and a not in merged:
                merged.append(a)
        emit({
            "name": disp, "display_name": disp, "aliases": merged,
            "location_type": n["node_type"], "building_code": n.get("building_code"),
            "floor": n["floor"], "lat": n["lat"], "lon": n["lon"], "area_name": None,
            "nearest_node_name": n["name"],   # the room's own node
            "nearest_bus_stop_name": None,
        }, n["name"])

    return specs


async def clear_existing_data(session):
    await session.execute(Saved_Location.__table__.delete())
    await session.execute(Recent_Location.__table__.delete())
    await session.execute(Map_Edge.__table__.delete())
    await session.execute(BusStopSchedule.__table__.delete())
    await session.execute(Bus.__table__.delete())
    await session.execute(Bus_Stop.__table__.delete())
    await session.execute(Canteen.__table__.delete())
    await session.execute(Location.__table__.delete())
    await session.execute(update(Building).values(entrance_node_id=None))
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
            #    Build without entrance_node_id first: it's a FK into map_nodes,
            #    and nodes aren't inserted until step 3. We set it in step 3a once
            #    the referenced nodes exist, then commit at the end.
            building_by_id = {}
            buildings = []
            for spec in BUILDING_SPECS:
                spec = dict(spec)                      # don't mutate the module-level spec
                spec.pop("entrance_node_name", None)   # not a model column
                b = Building(**spec)
                # footprint polygon lives in POI_EXTRAS (single source of truth), keyed by
                # name; mirror it onto the Building row so /campus-map serves it too.
                b.boundaries = copy.deepcopy(POI_EXTRAS.get(spec["name"], {}).get("boundaries"))
                buildings.append(b)
                building_by_id[b.building_id] = b
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
                    affine=f.get("affine") or [],
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
                UTOWN_NODE_SPECS,
                editor_nodes_to_specs(data),
            )
            node_by_name = {s["name"]: s for s in node_specs}

            # 3b) assemble edges now (they don't depend on inserted rows) so lift
            #     shafts can be aligned onto their lowest floor BEFORE the node
            #     and edge coordinates are frozen into ORM objects.
            edge_specs = (
                [normalise_edge_tuple(t) for t in BASE_EDGE_SPECS]
                + [normalise_edge_tuple(t) for t in UTOWN_EDGE_SPECS]
                + ACCESSIBLE_EDGE_SPECS
                + editor_edges_to_specs(data)
            )
            # editor-export nodes are triangulated (trusted) vs on-foot seed coords
            editor_node_names = frozenset(n["name"] for n in data.get("nodes", []))
            lift_moved = align_lift_shafts(node_by_name, edge_specs, editor_node_names)

            nodes = build_nodes(node_specs)
            session.add_all(nodes)

            # 3a) now that nodes exist, resolve each building's entrance FK.
            #     Flush so the FK target rows are present before we reference them.
            await session.flush()
            for spec in BUILDING_SPECS:
                entrance_name = spec.get("entrance_node_name")
                if entrance_name is None:
                    continue
                if entrance_name not in node_by_name:
                    raise KeyError(
                        f"building {spec['building_id']!r} references missing "
                        f"entrance node: {entrance_name!r}"
                    )
                building_by_id[spec["building_id"]].entrance_node_id = (
                    node_id_from_name(entrance_name)
                )

            # 4) edges (base + accessible + editor). edge_specs assembled in 3b.
            edges = build_edges(edge_specs, node_by_name)
            session.add_all(edges)

            # 5) locations — single source of truth (curated + de-duped promotions)
            locations = []
            canteens = []
            for spec in build_location_specs(node_specs):
                bid = resolve_building_id(spec["building_code"])
                fid = floor_id_by_key.get((bid, spec["floor"])) if bid else None
                loc_id = location_id_from_name(spec["name"])

                extras = POI_EXTRAS.get(spec["name"], {})   # empty for promoted rooms
                # deep-copy JSONB dicts: POI_EXTRAS reuses shared pattern objects.
                boundaries = copy.deepcopy(extras.get("boundaries"))
                opening_hours = copy.deepcopy(extras.get("opening_hours"))
                crowd_density = copy.deepcopy(extras.get("crowd_density"))

                nbs = spec["nearest_bus_stop_name"]
                locations.append(Location(
                    id=loc_id, name=spec["name"], description="",
                    display_name=spec["display_name"], aliases=spec["aliases"],
                    location_type=spec["location_type"],
                    building_id=bid, floor_id=fid, area_name=spec["area_name"],
                    latitude=spec["lat"], longitude=spec["lon"],
                    nearest_node_id=node_id_from_name(spec["nearest_node_name"]),
                    nearest_bus_stop_id=node_id_from_name(nbs) if nbs else None,
                    landmark_hint=None, arrival_instruction=None,
                    boundaries=boundaries,
                    opening_hours=opening_hours,
                    crowd_density=crowd_density,
                ))

                canteen_spec = extras.get("canteen")
                if canteen_spec is not None:
                    canteens.append(Canteen(
                        location_id=loc_id,
                        halal_availability=canteen_spec["halal_availability"],
                        stalls=list(canteen_spec.get("stalls", [])),
                    ))

            session.add_all(locations)
            session.add_all(canteens)

            # 6) bus stops + buses (independent of each other), then schedule links.
            #    bus_stops.node_id -> map_nodes (already inserted above).
            bus_stops = [
                Bus_Stop(
                    bus_stop_id=spec["bus_stop_id"],
                    name=spec["name"],
                    node_id=node_id_from_name(spec["node_name"]),
                )
                for spec in BUS_STOP_SPECS
            ]
            buses = [Bus(bus_number=spec["bus_number"]) for spec in BUS_SPECS]
            session.add_all(bus_stops)
            session.add_all(buses)

            # flush so Bus.bus_id (autoincrement) is populated before we link.
            await session.flush()
            bus_id_by_number = {b.bus_number: b.bus_id for b in buses}

            schedules = [
                BusStopSchedule(
                    bus_id=bus_id_by_number[bus_number],
                    bus_stop_id=bus_stop_id,
                    schedule=interval,
                )
                for (bus_number, bus_stop_id, interval) in BUS_STOP_SCHEDULE_SPECS
            ]
            session.add_all(schedules)

            await session.commit()

            print("Seed data inserted successfully.")
            print(f"  Buildings:  {len(buildings)}")
            print(f"  Floors:     {len(floors)}")
            print(f"  Nodes:      {len(nodes)} ({lift_moved} lift nodes snapped to lowest floor)")
            print(f"  Edges:      {len(edges)} ({len(edges)//2} bidirectional)")
            print(f"  Locations:  {len(locations)}")
            print(f"  Canteens:   {len(canteens)}")
            print(f"  Bus stops:  {len(bus_stops)}")
            print(f"  Buses:      {len(buses)}")
            print(f"  Schedules:  {len(schedules)}")

        except Exception:
            await session.rollback()
            print("Seed data failed. Rolled back changes.")
            raise


if __name__ == "__main__":
    asyncio.run(seed_data(clear_first=True))
