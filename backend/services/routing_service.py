from algorithms import astar
from algorithms import graph_builder
from schemas.route import RouteStep, RouteResponse
from utils.edge_classification import bearing, turn_delta, classify

async def generate_route(session, startNode_id, endNode_id, mode, current_user):
    node_by_id, edge_by_pair, graph_table, building_by_id = await graph_builder.buildGraph(session)
    path = astar.aStarAlgo(startNode_id, endNode_id, node_by_id, graph_table, mode, current_user)

    pace_factor = 1.0
    if current_user is not None:
        pace_factor = 1/current_user.pace_factor

    if path is None:
        return None
    step_count = 1
    total_distance = 0
    total_time = 0
    route_step_list =[]
    path_coordinates = []
    for edge_nodes in path:
        from_node_id, to_node_id = edge_nodes
        edge = edge_by_pair[edge_nodes]
        step_seconds = edge.estimated_seconds
        if edge.vertical == None and edge.mode == "walk":
            step_seconds = step_seconds * pace_factor
        
        route_step = RouteStep(
            step_number=step_count,
            transport_mode=edge.mode,
            distance_for_step=edge.distance_m,
            estimated_seconds=step_seconds,
            buildings_passed_by_id=[node_by_id[from_node_id].building_id, node_by_id[to_node_id].building_id],
            floor_transition=[node_by_id[from_node_id].floor, node_by_id[to_node_id].floor],
            from_name=node_by_id[from_node_id].name,
            from_node_id=from_node_id,
            from_node_type=node_by_id[from_node_id].node_type,
            to_name=node_by_id[to_node_id].name,
            to_node_id=to_node_id,
            to_node_type=node_by_id[to_node_id].node_type,
            vertical_edge=edge.vertical,
        )
        route_step_list.append(route_step)
        total_distance += edge.distance_m
        total_time += step_seconds
        step_count +=1
        path_coordinates.extend(edge.geometry)

    route_instructions = build_instructions(path, node_by_id, edge_by_pair, building_by_id)

    return RouteResponse(
        total_distance=total_distance,
        total_estimated_seconds=total_time,
        mode=mode,
        steps=route_step_list,
        path_coordinates=path_coordinates,
        route_instructions=route_instructions,
    )


def _floor_label(f):
    if f < 0:
        return "the basement" if f == -1 else f"basement {abs(f)}"
    return f"level {f}"


def build_instructions(path, node_by_id, edge_by_pair, building_by_id, min_distance=1.0):
    steps = []
    straight_distance = 0.0
    last_bearing = None
    on_bus = False

    def flush():
        nonlocal straight_distance
        if straight_distance >= min_distance:
            steps.append(f"Proceed forward for {round(straight_distance)} m")
        straight_distance = 0.0

    for i, (a, b) in enumerate(path):
        edge = edge_by_pair[(a, b)]
        na, nb = node_by_id[a], node_by_id[b]

        if edge.mode == "campus bus":
            if not on_bus:
                flush()
                steps.append(f"Board the campus shuttle at {na.name}")
                on_bus = True
            last_bearing = None
            continue
        if on_bus:
            # first non-bus edge -> we alighted at the previous stop (= na)
            steps.append(f"Alight at {na.name}")
            on_bus = False

        if edge.vertical:
            flush()
            if nb.floor != na.floor:
                direction = "up" if nb.floor > na.floor else "down"
                steps.append(f"Take the {edge.vertical} {direction} to {_floor_label(nb.floor)}")
            else:
                steps.append(f"Take the {edge.vertical}")
            last_bearing = None
            continue

        b_edge = bearing(na, nb)

        if last_bearing is None:            # first edge, or just after a vertical/bus
            if i == 0:
                steps.append(f"Start at {na.name}")
            straight_distance += edge.distance_m
        else:
            move = classify(turn_delta(last_bearing, b_edge))
            if move == "straight":
                straight_distance += edge.distance_m
            elif move == "u-turn":
                flush()
                steps.append("Make a U-turn")
                straight_distance = edge.distance_m
            else:                            # left / right
                if straight_distance >= min_distance:
                    steps.append(f"In {round(straight_distance)} m, turn {move}")
                else:
                    steps.append(f"Turn {move}")   # back-to-back turns
                straight_distance = edge.distance_m

        # building transition (checked on every walking edge)
        if nb.building_id != na.building_id:
            flush()
            if nb.building_id is None:
                steps.append("Head outdoors")
            else:
                steps.append(f"Enter {building_by_id[nb.building_id].display_name}")

        last_bearing = b_edge

    flush()
    if on_bus:
        steps.append(f"Alight at {node_by_id[path[-1][1]].name}")
    steps.append(f"You have arrived at {node_by_id[path[-1][1]].name}")
    return steps
    

