"""
Fixture data for test.py.

Generated from the live seed (updated_seed.py + routes_map_data.json + poi_extras.py),
not hand-authored: every expected_ids set replicates the backend's actual query
semantics, and every route pair was BFS-verified reachable in the correct subgraph
(full graph for 'fastest', accessible-only edges for 'accessible').

Conventions:
  - /locations/search and /locations?location_type= return 200 + [] when nothing
    matches (never 404).
  - search uses normalise(): lowercased, non-alphanumeric stripped, on name +
    display_name + aliases(joined ''). So 'E&A' -> 'ea', '04-01' -> '0401', etc.
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
    mode: str


# =====================================================================
# LOCATIONS
# =====================================================================

search_locations = [
    SearchCase(query='library', expected_status=200, expected_ids={'loc_central_library'}),  # only the central library
    SearchCase(query='Database', expected_status=200, expected_ids={'loc_database_1', 'loc_database_2', 'loc_database_3'}),  # Database 1/2/3
    SearchCase(query='SR', expected_status=200, expected_ids={'loc_executive_classroom_04_02', 'loc_isa_lab4', 'loc_sr1', 'loc_sr10', 'loc_sr2', 'loc_sr3', 'loc_sr5', 'loc_sr6', 'loc_sr7', 'loc_sr8', 'loc_sr9', 'loc_sr_lt19', 'loc_supplies_room', 'loc_supplies_room_2'}),  # cross-alias hits: 'supplies room', 'isa lab4'(...sr...), exec classroom all normalise to contain 'sr'
    SearchCase(query='LT', expected_status=200, expected_ids={'loc_career_consultation_room', 'loc_lecture_theatre_14', 'loc_lecture_theatre_15', 'loc_lt_16', 'loc_lt_17', 'loc_lt_19', 'loc_multipurpose_space_04_01', 'loc_sr_lt19'}),  # matches LT14/15/16/17/19 + 'career consuLTation' + 'muLTipurpose' + 'sr @ lt19'
    SearchCase(query='Deck', expected_status=200, expected_ids={'loc_deck'}),  # only the Deck
    SearchCase(query='Terrace', expected_status=200, expected_ids={'loc_terrace'}),  # only the Terrace
    SearchCase(query='E&A', expected_status=200, expected_ids={'loc_active_learning_lab', 'loc_eanda_cluster', 'loc_eanda_cluster_2', 'loc_eanda_cluster_3', 'loc_eanda_cluster_4', 'loc_embedded_systems_teaching_lab_1', 'loc_embedded_systems_teaching_lab_2', 'loc_isa_lab4', 'loc_lecture_theatre_14', 'loc_lecture_theatre_15', 'loc_lt_16', 'loc_lt_17', 'loc_lt_19', 'loc_research_equipment_room'}),  # normalises to 'ea'; hits clusters + 'teaching lab'(...ea...) + 'research'(...ea...) + LTs(...eatre...)
    SearchCase(query='lab', expected_status=200, expected_ids={'loc_active_learning_lab', 'loc_data_comms_and_networking_lab', 'loc_embedded_systems_teaching_lab_1', 'loc_embedded_systems_teaching_lab_2', 'loc_gs_lab_com2', 'loc_icpc_lab', 'loc_isa_lab3', 'loc_isa_lab4', 'loc_it_security_and_os_lab', 'loc_pl1', 'loc_pl2', 'loc_pl3', 'loc_pl4', 'loc_pl5', 'loc_pl6', 'loc_robot_experiment_lab'}),  # every '...lab' room
    SearchCase(query='cluster', expected_status=200, expected_ids={'loc_eanda_cluster', 'loc_eanda_cluster_2', 'loc_eanda_cluster_3', 'loc_eanda_cluster_4'}),  # the four E&A clusters
    SearchCase(query='zzzznotathing', expected_status=200, expected_ids=set()),  # no match -> 200 + empty
]

get_location = [
    LocationIdCase(location_id='loc_com1', expected_status=200),
    LocationIdCase(location_id='loc_com2', expected_status=200),
    LocationIdCase(location_id='loc_com3', expected_status=200),
    LocationIdCase(location_id='loc_central_library', expected_status=200),
    LocationIdCase(location_id='loc_terrace', expected_status=200),
    LocationIdCase(location_id='loc_deck', expected_status=200),
    LocationIdCase(location_id='loc_lecture_theatre_14', expected_status=200),
    LocationIdCase(location_id='loc_sr1', expected_status=200),
    LocationIdCase(location_id='definitely-not-real', expected_status=404),
    LocationIdCase(location_id='loc_com4', expected_status=404),
]

# one TypeCase per seeded location_type (full id-set each) + a non-existent type.
get_location_by_type = [
    TypeCase(location_type='COM', expected_status=200, expected_ids={'loc_com1', 'loc_com2', 'loc_com3'}),
    TypeCase(location_type='canteen', expected_status=200, expected_ids={'loc_deck', 'loc_terrace'}),
    TypeCase(location_type='central library', expected_status=200, expected_ids={'loc_central_library'}),
    TypeCase(location_type='discussion room', expected_status=200, expected_ids={'loc_dr1', 'loc_dr12', 'loc_dr2', 'loc_dr3', 'loc_dr4'}),
    TypeCase(location_type='lab', expected_status=200, expected_ids={'loc_active_learning_lab', 'loc_data_comms_and_networking_lab', 'loc_embedded_systems_teaching_lab_1', 'loc_embedded_systems_teaching_lab_2', 'loc_gs_lab_com2', 'loc_icpc_lab', 'loc_isa_lab3', 'loc_isa_lab4', 'loc_it_security_and_os_lab', 'loc_pl1', 'loc_pl2', 'loc_pl3', 'loc_pl4', 'loc_pl5', 'loc_pl6', 'loc_robot_experiment_lab'}),
    TypeCase(location_type='lecture theatre', expected_status=200, expected_ids={'loc_lecture_theatre_14', 'loc_lecture_theatre_15', 'loc_lt_16', 'loc_lt_17', 'loc_lt_19'}),
    TypeCase(location_type='room', expected_status=200, expected_ids={'loc_ai_1', 'loc_av_control_room', 'loc_career_consultation_room', 'loc_cerebro_soc', 'loc_computational_biology_1', 'loc_computational_biology_2', 'loc_computer_room_1', 'loc_computing_club', 'loc_computing_gallery', 'loc_database_1', 'loc_database_2', 'loc_database_3', 'loc_eanda_cluster', 'loc_eanda_cluster_2', 'loc_eanda_cluster_3', 'loc_eanda_cluster_4', 'loc_executive_classroom_04_02', 'loc_former_information_systems_1', 'loc_former_information_systems_2', 'loc_graduate_students_lounge', 'loc_innovation_and_entrepreneurship', 'loc_lobby', 'loc_mr4', 'loc_mr5', 'loc_multipurpose_space_04_01', 'loc_research_equipment_room', 'loc_robot_living_studio', 'loc_students_lounge', 'loc_supplies_room', 'loc_supplies_room_2', 'loc_tech_hangout', 'loc_technical_room_1', 'loc_technical_room_2', 'loc_undergraduate_studies', 'loc_vc_room'}),
    TypeCase(location_type='seminar room', expected_status=200, expected_ids={'loc_sr1', 'loc_sr10', 'loc_sr2', 'loc_sr3', 'loc_sr5', 'loc_sr6', 'loc_sr7', 'loc_sr8', 'loc_sr9', 'loc_sr_lt19'}),
    TypeCase(location_type='tutorial room', expected_status=200, expected_ids={'loc_tr10', 'loc_tr11', 'loc_tr12', 'loc_tr9'}),
    TypeCase(location_type='zzzznotatype', expected_status=200, expected_ids=set()),
]

# =====================================================================
# BUSES   (only D1 + 2 stops are seeded -- negatives fill out the 10)
# =====================================================================

get_bus = [
    BusCase(bus_number='D1', expected_status=200),
    BusCase(bus_number='A1', expected_status=404),
    BusCase(bus_number='A2', expected_status=404),
    BusCase(bus_number='D2', expected_status=404),
    BusCase(bus_number='K', expected_status=404),
    BusCase(bus_number='E', expected_status=404),
    BusCase(bus_number='BTC', expected_status=404),
    BusCase(bus_number='L', expected_status=404),
    BusCase(bus_number='999', expected_status=404),
    BusCase(bus_number='d1', expected_status=404),
]

get_bus_stop_by_id = [
    BusStopIdCase(bus_stop_id='clb_bus_stop', expected_status=200),
    BusStopIdCase(bus_stop_id='utown_bus_stop', expected_status=200),
    BusStopIdCase(bus_stop_id='not-a-stop', expected_status=404),
    BusStopIdCase(bus_stop_id='com1_bus_stop', expected_status=404),
    BusStopIdCase(bus_stop_id='deck_bus_stop', expected_status=404),
    BusStopIdCase(bus_stop_id='CLB_BUS_STOP', expected_status=404),
    BusStopIdCase(bus_stop_id='clb', expected_status=404),
    BusStopIdCase(bus_stop_id='utown', expected_status=404),
    BusStopIdCase(bus_stop_id='kr_bus_stop', expected_status=404),
    BusStopIdCase(bus_stop_id='science_bus_stop', expected_status=404),
]

# get_bus_stop_by_name: name.ilike(%q%), returns FIRST match.
# stop names are 'Central Library' and 'University Town'.
get_bus_stop_by_name = [
    SearchCase(query='Central', expected_status=200),
    SearchCase(query='Library', expected_status=200),
    SearchCase(query='central library', expected_status=200),
    SearchCase(query='University', expected_status=200),
    SearchCase(query='Town', expected_status=200),
    SearchCase(query='university town', expected_status=200),
    SearchCase(query='zzznostop', expected_status=404),
    SearchCase(query='College', expected_status=404),
    SearchCase(query='Deck', expected_status=404),
    SearchCase(query='Science', expected_status=404),
]

# =====================================================================
# CAMPUS MAP
# =====================================================================

get_node = [
    NodeCase(node_id='node_com3_elevator', expected_status=200),  # com3 stub lift, floor 1
    NodeCase(node_id='node_com2_entrance', expected_status=200),  # com2 entrance
    NodeCase(node_id='node_com1_main_entrance_floor_1', expected_status=200),  # com1 entrance
    NodeCase(node_id='node_central_library_lift', expected_status=200),  # CLB lift
    NodeCase(node_id='node_utown_bus_stop', expected_status=200),  # outdoor bus-stop node
    NodeCase(node_id='node_sr1', expected_status=200),  # com1 L2 seminar room
    NodeCase(node_id='node_dr1', expected_status=200),  # com1 basement discussion room
    NodeCase(node_id='node_lt_19', expected_status=200),  # com2 lecture theatre
    NodeCase(node_id='not-a-node', expected_status=404),
    NodeCase(node_id='node_com1', expected_status=404),
]

# coords are taken AT a real node on a populated floor -> nearest is that node.
nearest_node = [
    NearestCase(lat=1.2946253, lon=103.7749732, floor=1, expected_status=200),  # -> node_com3_elevator
    NearestCase(lat=1.2943984, lon=103.7739848, floor=1, expected_status=200),  # -> node_com2_entrance
    NearestCase(lat=1.2948749, lon=103.7736782, floor=1, expected_status=200),  # -> node_com1_main_entrance_floor_1
    NearestCase(lat=1.2961927, lon=103.773159, floor=1, expected_status=200),  # -> node_central_library_lift
    NearestCase(lat=1.303662152778908, lon=103.77474325618729, floor=1, expected_status=200),  # -> node_utown_bus_stop
    NearestCase(lat=1.2944054, lon=103.7743158, floor=1, expected_status=200),  # -> node_the_terrace
    NearestCase(lat=1.2946732, lon=103.7724432, floor=1, expected_status=200),  # -> node_deck
    NearestCase(lat=1.2950321, lon=103.7739228, floor=2, expected_status=200),  # -> node_sr1
    NearestCase(lat=1.2952511, lon=103.7739064, floor=-1, expected_status=200),  # -> node_dr1
    NearestCase(lat=1.2937961, lon=103.7744234, floor=1, expected_status=200),  # -> node_lt_19
]

# building search: name/display_name/aliases(' ' joined) ilike %q% OR normalise(q) in aliases('' joined).
# only com1/com2 are seeded.
search_buildings = [
    SearchCase(query='COM', expected_status=200, expected_ids={'com1', 'com2'}),
    SearchCase(query='com1', expected_status=200, expected_ids={'com1'}),
    SearchCase(query='com2', expected_status=200, expected_ids={'com2'}),
    SearchCase(query='Computing', expected_status=200, expected_ids={'com1', 'com2'}),
    SearchCase(query='Computing 1', expected_status=200, expected_ids={'com1'}),
    SearchCase(query='Computing 2', expected_status=200, expected_ids={'com2'}),
    SearchCase(query='1', expected_status=200, expected_ids={'com1'}),  # only 'Computing 1' / 'COM1' contain '1'
    SearchCase(query='2', expected_status=200, expected_ids={'com2'}),  # only com2 side contains '2'
    SearchCase(query='comp', expected_status=200, expected_ids={'com1', 'com2'}),  # 'comp' substring of 'Computing'
    SearchCase(query='zzzz', expected_status=200, expected_ids=set()),  # no match
]

get_building = [
    BuildingCase(building_id='com1', expected_status=200),
    BuildingCase(building_id='com2', expected_status=200),
    # not seeded as Building rows (building_code only) -> 404
    BuildingCase(building_id='com3', expected_status=404),
    BuildingCase(building_id='clb', expected_status=404),
    BuildingCase(building_id='as6', expected_status=404),
    BuildingCase(building_id='as8', expected_status=404),
    BuildingCase(building_id='deck', expected_status=404),
    BuildingCase(building_id='COM1', expected_status=404),
    BuildingCase(building_id='science', expected_status=404),
    BuildingCase(building_id='not-a-building', expected_status=404),
]

get_building_floors = [
    BuildingCase(building_id='com1', expected_status=200),   # floors [-1, 1, 2]
    BuildingCase(building_id='com2', expected_status=200),   # floors [1, 2, 3, 4]
    BuildingCase(building_id='com3', expected_status=404),
    BuildingCase(building_id='clb', expected_status=404),
    BuildingCase(building_id='as6', expected_status=404),
    BuildingCase(building_id='as8', expected_status=404),
    BuildingCase(building_id='deck', expected_status=404),
    BuildingCase(building_id='COM2', expected_status=404),
    BuildingCase(building_id='science', expected_status=404),
    BuildingCase(building_id='not-a-building', expected_status=404),
]

get_floor = [
    FloorCase(building_id='com1', floor_number=1, expected_status=200),
    FloorCase(building_id='com1', floor_number=-1, expected_status=200),
    FloorCase(building_id='com1', floor_number=2, expected_status=200),
    FloorCase(building_id='com2', floor_number=1, expected_status=200),
    FloorCase(building_id='com2', floor_number=4, expected_status=200),
    FloorCase(building_id='com2', floor_number=2, expected_status=200),
    FloorCase(building_id='com1', floor_number=99, expected_status=404),
    FloorCase(building_id='com1', floor_number=3, expected_status=404),
    FloorCase(building_id='com2', floor_number=-1, expected_status=404),
    FloorCase(building_id='com3', floor_number=1, expected_status=404),
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
# All pairs BFS-verified: 'fastest' reachable in the full graph, 'accessible'
# reachable using only is_accessible edges (mirrors A*'s filter). test.py
# cross-checks each against networkx Dijkstra, so a wrong status is a backend
# finding, not a fixture error.
routes = [
    # ---- fastest (10) ----
    RouteCase('node_central_library_entrance', 'node_pl5', 'fastest'),  # Central library entrance -> PL5
    RouteCase('node_central_library_bus_stop', 'node_dr3', 'fastest'),  # Central Library bus stop -> DR3
    RouteCase('node_utown_bus_stop', 'node_dr4', 'fastest'),  # UTown bus stop -> DR4
    RouteCase('node_deck', 'node_pl2', 'fastest'),  # Deck -> PL2
    RouteCase('node_main_deck_entrance', 'node_pl3', 'fastest'),  # Main deck entrance -> PL3
    RouteCase('node_com2_entrance', 'node_pl4', 'fastest'),  # Com2 entrance -> PL4
    RouteCase('node_the_terrace', 'node_computing_gallery', 'fastest'),  # The Terrace -> Computing Gallery
    RouteCase('node_com3_elevator', 'node_mr5', 'fastest'),  # COM3 Elevator -> MR5
    RouteCase('node_as6_lift1', 'node_lt_19', 'fastest'),  # As6 lift1 -> LT 19
    RouteCase('node_as8_lift', 'node_gs_lab_com2', 'fastest'),  # As8 lift -> GS Lab @com2
    # ---- accessible (10) ----
    RouteCase('node_central_library_entrance', 'node_gs_lab_com2', 'accessible'),  # Central library entrance -> GS Lab @com2
    RouteCase('node_central_library_bus_stop', 'node_computing_gallery', 'accessible'),  # Central Library bus stop -> Computing Gallery
    RouteCase('node_utown_bus_stop', 'node_sr10', 'accessible'),  # UTown bus stop -> SR10
    RouteCase('node_deck', 'node_sr5', 'accessible'),  # Deck -> SR5
    RouteCase('node_main_deck_entrance', 'node_sr6', 'accessible'),  # Main deck entrance -> SR6
    RouteCase('node_com2_entrance', 'node_deck', 'accessible'),  # Com2 entrance -> Deck
    RouteCase('node_the_terrace', 'node_sr8', 'accessible'),  # The Terrace -> SR8
    RouteCase('node_com3_elevator', 'node_sr9', 'accessible'),  # COM3 Elevator -> SR9
    RouteCase('node_as6_lift1', 'node_tr12', 'accessible'),  # As6 lift1 -> TR12
    RouteCase('node_as8_lift', 'node_vc_room', 'accessible'),  # As8 lift -> vc room
    # ---- negative controls (reachable in fastest, NOT in accessible subgraph) ----
    RouteCase('node_central_library_bus_stop', 'node_central_library_stairs', 'accessible'),  # stairs-only -> expect 404
    RouteCase('node_deck', 'node_top_of_staircase_leading_to_deck', 'accessible'),            # stairs-only -> expect 404
]
