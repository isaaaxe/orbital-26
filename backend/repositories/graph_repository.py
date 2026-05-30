from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.map_edges import Map_Edge
from models.map_nodes import Map_Node
from algorithms.geo_conversion import haversine_m

async def get_node_by_coord(session, latitude, longitude, floor):
    statement = select(Map_Node)

    result = await session.execute(statement)
    nodes = result.scalars().all()

    diff = float("inf")
    nearest_node: Map_Node = None
    nearest_node_floor: Map_Node = None
    diff_same_floor = float("inf")
    for node in nodes:
        node: Map_Node
        dist = haversine_m(node.latitude, node.longitude, latitude, longitude)
        if dist < diff:
            nearest_node = node
            diff = dist

        if floor == node.floor and dist < diff_same_floor :
            nearest_node_floor = node
            diff_same_floor = dist
    
    if nearest_node_floor is not None:
        return nearest_node_floor

    return nearest_node

async def get_node_by_id(session, node_id):
    statement = select(Map_Node).where(Map_Node.node_id == node_id)

    result = await session.execute(statement)
    node = result.scalar_one_or_none()
    
    return node


async def get_all_nodes(session) -> list[Map_Node]:
    statement = select(Map_Node)

    result = await session.execute(statement)
    nodes = result.scalars().all()
    
    return list(nodes)
    

async def get_all_edges(session) -> list[Map_Edge]:
    statement = select(Map_Edge)

    result = await session.execute(statement)
    edges = result.scalars().all()
    
    return list(edges)

async def get_edges_from_node(session, node_id) -> list[Map_Edge]:
    statement = select(Map_Edge).where(Map_Edge.from_node_id == node_id)
    result = await session.execute(statement)
    edges = result.scalars().all()
    
    return list(edges)