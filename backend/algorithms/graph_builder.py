from models.map_nodes import Map_Node
from models.map_edges import Map_Edge
from models.buildings import Building
from repositories import graph_repository, campus_map_repository
from core.database import AsyncSessionLocal



async def buildGraph(session):
    node_by_id = dict()
    building_by_id = dict()
    edge_by_pair = dict()
    graph_table = dict()

    nodeList: list[Map_Node] = await graph_repository.get_all_nodes(session)
    edgeList: list[Map_Edge] = await graph_repository.get_all_edges(session)
    buildingList : list[Building] = await campus_map_repository.get_all_buildings(session)

    for node in nodeList:
        node_by_id.update({node.node_id: node})

    for building in buildingList:
        building_by_id.update({building.building_id: building})

    for edge in edgeList:
        edge_by_pair.update({(edge.from_node_id, edge.to_node_id): edge})

    graph_table = dict()
    for node in nodeList:
        graph_table[node.node_id] = []

        
    for edge in edgeList:
        graph_table[edge.from_node_id].append({
            "to": edge.to_node_id,
            "cost": edge.estimated_seconds,
            "edge_id": edge.edge_id,
            "mode": edge.mode,
            "vertical": edge.vertical,
            "is_accessible": edge.is_accessible, 
            "is_sheltered": edge.is_sheltered,
        })
        
    #("GRAPH TABLE:", graph_table)
    return GraphCache(node_by_id, edge_by_pair, graph_table, building_by_id)

class GraphCache:
    def __init__(self, node_by_id, edge_by_pair, graph_table, building_by_id):
        self.node_by_id = node_by_id
        self.edge_by_pair = edge_by_pair
        self.graph_table = graph_table
        self.building_by_id = building_by_id