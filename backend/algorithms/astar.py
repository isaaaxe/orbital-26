from algorithms import graph_builder
from algorithms.geo_conversion import haversine_m

from math import radians, sin, cos, sqrt, atan2
import heapq

fastest_speed_m_per_second = 8

#adjust heuristic based on mode later
def aStarAlgo(startNode_id: str, endNode_id: str, node_by_id, graph_table, mode):
    if startNode_id not in node_by_id or endNode_id not in node_by_id:
        return None

    #node_by_id, edge_by_pair, graph_table = await graph_builder.buildGraph()
    dist_to_end = triangulate_dist(startNode_id, endNode_id, node_by_id)
    #heuristic using fastest speed
    estimated_remaining_seconds : float = dist_to_end / fastest_speed_m_per_second

    heap = []
    visited = set()
    parentDict = dict()
    parentDict[startNode_id] = None
    #time + estimated remaining time, node, time, parent
    heapq.heappush(heap, (0 + estimated_remaining_seconds, startNode_id, 0, None))
    while heap:
        val, node_id, time, parent = heapq.heappop(heap)
        if node_id in visited:
            continue
        
        visited.add(node_id)
        parentDict[node_id] = parent

        if node_id == endNode_id:
            break

        for neighbour in graph_table.get(node_id, []):
            next_node_id = neighbour["to"]
            edgeCost = neighbour["cost"]
            edge_id = neighbour["edge_id"]
            if next_node_id in visited:
                continue
            dist_to_end = triangulate_dist(next_node_id, endNode_id, node_by_id)
            estimated_remaining_seconds : float = dist_to_end / fastest_speed_m_per_second
            heapq.heappush(heap, (time+edgeCost+estimated_remaining_seconds, next_node_id, time+edgeCost, node_id))
    
    if endNode_id not in parentDict:
        return None
    
    return construct_path(parentDict, startNode_id, endNode_id)

def construct_path(parentDict: dict, startNode_id, endNode_id):
    curr = endNode_id
    path = []
    #might have to include self referencing edges
    while curr != startNode_id:
        parent = parentDict[curr]
        path.append((parent, curr))
        curr = parent

    path.reverse()
    return path

def triangulate_dist(startNode_id, endNode_id, node_by_id):
    startNode = node_by_id[startNode_id]
    endNode = node_by_id[endNode_id]

    dist = haversine_m(startNode.latitude, startNode.longitude, endNode.latitude, endNode.longitude)
    return dist
