from repositories import graph_repository
from schemas import campus_map
from models.map_nodes import Map_Node
from algorithms.geo_conversion import haversine_m

from math import sqrt

async def search_nearest_node(session, latitude, longitude, floor):
    nearest_node = await graph_repository.get_node_by_coord(session, latitude, longitude, floor)
    if nearest_node is None:
        return None

    distance = haversine_m(nearest_node.latitude, nearest_node.longitude, latitude, longitude)

    return campus_map.NearestNode(
        nearest_node_id=nearest_node.node_id,
        distance_to_nearest_node=distance,
    )

async def get_node(session, node_id):
    node: Map_Node = await graph_repository.get_node_by_id(session, node_id)
    if node is None:
        return None

    return campus_map.NodeDetail(
        node_id=node.node_id,
        name=node.name,
        node_type=node.node_type,
        building_id=node.building_id,
        building_code=node.building_code,
        floor=node.floor,
        latitude=node.latitude,
        longitude=node.longitude,
    )


    