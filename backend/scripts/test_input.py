"""
Fixture data for test.py — populated from discover_fixtures.py output.

Conventions:
  - /locations/search and /locations?location_type= return 200 + [] when nothing
    matches (never 404). "No results" => expected_status=200, expected_ids=set().
  - id-lookups (/locations/{id}, nodes/{id}, buildings/{id}, bus lookups, floor) 404.
  - expected_ids is the SET of `id` values the list endpoint returns.
"""

from dataclasses import dataclass, field


@dataclass
class SearchCase:
    query: str
    expected_status: int = 200
    expected_ids: set = field(default_factory=set)

@dataclass
class LocationIdCase:
    location_id: str
    expected_status: int = 200

@dataclass
class TypeCase:
    location_type: str
    expected_status: int = 200
    expected_ids: set = field(default_factory=set)

@dataclass
class BusCase:
    bus_number: str
    expected_status: int = 200

@dataclass
class BusStopIdCase:
    bus_stop_id: str
    expected_status: int = 200

@dataclass
class NodeCase:
    node_id: str
    expected_status: int = 200

@dataclass
class NearestCase:
    lat: float
    lon: float
    floor: int
    expected_status: int = 200

@dataclass
class BuildingCase:
    building_id: str
    expected_status: int = 200

@dataclass
class FloorCase:
    building_id: str
    floor_number: int
    expected_status: int = 200

@dataclass
class RouteCase:
    start_id: str
    destination_id: str
    mode: str          # "fastest" or "accessible"


# =====================================================================
# LOCATIONS
# =====================================================================

search_locations = [
    SearchCase(query='Central', expected_status=200, expected_ids={'loc_central_library'}),
    # multi-hit token: every seminar room is "SR<n>", all contain "SR"
    SearchCase(query='SR', expected_status=200, expected_ids={
        'loc_sr1', 'loc_sr2', 'loc_sr3', 'loc_sr5', 'loc_sr6',
        'loc_sr7', 'loc_sr8', 'loc_sr9', 'loc_sr10', 'loc_sr_lt19'}),  # confirm none also alias-match elsewhere
    SearchCase(query='zzzznotathing', expected_status=200, expected_ids=set()),
]

get_location = [
    LocationIdCase(location_id='loc_com1', expected_status=200),
    LocationIdCase(location_id='loc_central_library', expected_status=200),
    LocationIdCase(location_id='definitely-not-real', expected_status=404),
]

get_location_by_type = [
    TypeCase(location_type='room', expected_status=200, expected_ids={
        'loc_lobby', 'loc_students_lounge', 'loc_database_1', 'loc_supplies_room',
        'loc_eanda_cluster', 'loc_database_2', 'loc_multipurpose_space_04_01',
        'loc_computer_room_1', 'loc_database_3', 'loc_eanda_cluster_2',
        'loc_computing_gallery', 'loc_technical_room_1', 'loc_career_consultation_room',
        'loc_computational_biology_1', 'loc_mr4', 'loc_ai_1', 'loc_tech_hangout',
        'loc_eanda_cluster_3', 'loc_innovation_and_entrepreneurship', 'loc_supplies_room_2',
        'loc_cerebro_soc', 'loc_computing_club', 'loc_former_information_systems_1',
        'loc_graduate_students_lounge', 'loc_executive_classroom_04_02', 'loc_av_control_room',
        'loc_eanda_cluster_4', 'loc_robot_living_studio', 'loc_mr5',
        'loc_computational_biology_2', 'loc_former_information_systems_2', 'loc_vc_room',
        'loc_research_equipment_room', 'loc_technical_room_2', 'loc_undergraduate_studies'}),
    TypeCase(location_type='COM', expected_status=200,
             expected_ids={'loc_com1', 'loc_com2', 'loc_com3'}),
    TypeCase(location_type='zzzznotatype', expected_status=200, expected_ids=set()),
]


# =====================================================================
# BUSES
# =====================================================================

get_bus = [
    BusCase(bus_number='D1', expected_status=200),
    BusCase(bus_number='999', expected_status=404),
]

get_bus_stop_by_id = [
    BusStopIdCase(bus_stop_id='clb_bus_stop', expected_status=200),
    BusStopIdCase(bus_stop_id='utown_bus_stop', expected_status=200),
    BusStopIdCase(bus_stop_id='not-a-stop', expected_status=404),
]

get_bus_stop_by_name = [
    SearchCase(query='Central', expected_status=200),    # ilike %Central% -> clb_bus_stop
    SearchCase(query='University', expected_status=200),  # -> utown_bus_stop
    SearchCase(query='zzzznostop', expected_status=404),
]


# =====================================================================
# CAMPUS MAP
# =====================================================================

get_node = [
    NodeCase(node_id='node_com3_elevator', expected_status=200),
    NodeCase(node_id='node_com2_entrance', expected_status=200),
    NodeCase(node_id='not-a-node', expected_status=404),
]

nearest_node = [
    NearestCase(lat=1.2946253, lon=103.7749732, floor=1, expected_status=200),  # -> node_com3_elevator
]

search_buildings = [
    SearchCase(query='COM', expected_status=200, expected_ids={'com1', 'com2'}),  # VERIFY against endpoint
    SearchCase(query='zzzz', expected_status=200, expected_ids=set()),
]

get_building = [
    BuildingCase(building_id='com1', expected_status=200),
    BuildingCase(building_id='com2', expected_status=200),
    BuildingCase(building_id='not-a-building', expected_status=404),
]

get_building_floors = [
    BuildingCase(building_id='com1', expected_status=200),   # floors [-1, 1, 2]
    BuildingCase(building_id='com2', expected_status=200),   # floors [1, 2, 3, 4]
    BuildingCase(building_id='not-a-building', expected_status=404),
]

get_floor = [
    FloorCase(building_id='com1', floor_number=1, expected_status=200),
    FloorCase(building_id='com1', floor_number=-1, expected_status=200),  # basement exists
    FloorCase(building_id='com2', floor_number=4, expected_status=200),
    FloorCase(building_id='com1', floor_number=99, expected_status=404),
]


# =====================================================================
# SAVES / RECENT
# =====================================================================

save_valid_location = 'loc_com1'
save_invalid_location = 'definitely-not-real'
recent_location_a = 'loc_com1'
recent_location_b = 'loc_com2'      # must differ from recent_location_a


# =====================================================================
# ROUTES
# =====================================================================
# From discovery: the seed was a stair node, so its accessible subgraph reached
# nothing -> no valid accessible pair was auto-generated. The first case is the
# fastest pair; the second is the expected-404 (reachable in fastest, not in
# accessible). FILL the third with two ACCESSIBLE-connected nodes (e.g. an
# elevator/walkway pair) once you confirm they link in accessible mode.
routes = [
    RouteCase('node_stair_b_com1_floor_1', 'node_utown_bus_stop', 'fastest'),
    RouteCase('node_stair_b_com1_floor_1', 'node_corr1_com1_floor1', 'accessible'),  # expect 404
    RouteCase('node_central_library_entrance', 'node_deck', 'accessible', must_route=True),
    RouteCase('node_the_terrace', 'node_cerebro_soc', 'accessible', must_route=True),
]
