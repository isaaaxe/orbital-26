from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.map_edges import Map_Edge
from models.map_nodes import Map_Node

async def get_node_by_coord(session, latitude, longitude):
    statement = select(Map_Node)

    result = await session.execute(statement)
    nodes = result.scalar().all()

    diff = float("inf")
    nearest_node = None
    for node in nodes:
        distance = (node.longitude - longitude)**2 + (node.latitude - latitude)**2
        if distance < diff:
            nearest_node = node
            diff = distance

    return nearest_node

async def get_node_by_id(session, node_id):
    statement = select(Map_Node).where(Map_Node.id == node_id)

    result = await session.execute(statement)
    node = result.scalar_one_or_none()
    
    return node


async def get_all_nodes(session) -> list[Map_Node]:
    statement = select(Map_Node)

    result = await session.execute(statement)
    nodes = result.scalar().all()
    
    return list(nodes)
    

async def get_all_edges(session) -> list[Map_Edge]:
    statement = select(Map_Edge)

    result = await session.execute(statement)
    edges = result.scalar().all()
    
    return list(edges)

async def get_edges_from_node(session, node_id) -> list[Map_Edge]:
    statement = select(Map_Edge).where(Map_Edge.from_node_id == node_id)
    result = await session.execute(statement)
    edges = result.scalar().all()
    
    return list(edges)