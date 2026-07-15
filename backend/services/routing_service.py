from algorithms import astar
from algorithms import graph_builder
from schemas.route import RouteStep, RouteResponse

async def generate_route(session, startNode_id, endNode_id, mode, current_user):
    node_by_id, edge_by_pair, graph_table = await graph_builder.buildGraph(session)
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
        instruction = edge.instruction or f"Travel from {node_by_id[from_node_id].name} to {node_by_id[to_node_id].name}."
        same_floor = node_by_id[from_node_id].floor == node_by_id[to_node_id].floor
        step_seconds = edge.estimated_seconds
        if same_floor and edge.mode == "walk":
            step_seconds = step_seconds * pace_factor
        
        route_step = RouteStep(
            step_number=step_count,
            step_instruction=instruction,
            transport_mode=edge.mode,
            distance_for_step=edge.distance_m,
            estimated_seconds=step_seconds,
            buildings_passed_by_id=[node_by_id[from_node_id].building_id, node_by_id[to_node_id].building_id],
            floor_transition=[node_by_id[from_node_id].floor, node_by_id[to_node_id].floor],
            from_name=node_by_id[from_node_id].name,
            from_node_id=from_node_id,
            to_name=node_by_id[to_node_id].name,
            to_node_id=to_node_id,
        )
        route_step_list.append(route_step)
        total_distance += edge.distance_m
        total_time += step_seconds
        step_count +=1
        path_coordinates.extend(edge.geometry)

    return RouteResponse(
        total_distance=total_distance,
        total_estimated_seconds=total_time,
        mode=mode,
        steps=route_step_list,
        path_coordinates=path_coordinates
    )



    

