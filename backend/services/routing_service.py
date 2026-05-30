from algorithms import astar
from algorithms import graph_builder
from schemas.route import RouteStep, RouteResponse

async def generate_route(session, startNode_id, endNode_id, mode):
    node_by_id, edge_by_pair, graph_table = await graph_builder.buildGraph(session)
    path = astar.aStarAlgo(startNode_id, endNode_id, node_by_id, graph_table, mode)

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
        route_step = RouteStep(
            step_number=step_count,
            step_instruction=instruction,
            transport_mode=edge.mode,
            distance_for_step=edge.distance_m,
            estimated_seconds=edge.estimated_seconds,
            from_name=node_by_id[from_node_id].name,
            to_name=node_by_id[to_node_id].name,
        )
        route_step_list.append(route_step)
        total_distance += edge.distance_m
        total_time += edge.estimated_seconds
        step_count +=1
        path_coordinates.extend(edge.geometry)

    return RouteResponse(
        total_distance=total_distance,
        total_estimated_seconds=total_time,
        mode=mode,
        steps=route_step_list,
        path_coordinates=path_coordinates
    )


    

