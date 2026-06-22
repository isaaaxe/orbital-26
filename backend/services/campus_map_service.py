from repositories import graph_repository, campus_map_repository
from schemas import campus_map
from models.map_nodes import Map_Node
from models.buildings import Building
from models.floors import Floor
from algorithms.geo_conversion import haversine_m

from math import sqrt

async def search_nearest_node(session, latitude, longitude, floor):
    nearest_node = await graph_repository.get_node_by_coord(session, latitude, longitude, floor)
    if nearest_node is None:
        return None

    distance = haversine_m(nearest_node.latitude, nearest_node.longitude, latitude, longitude)
    formatted_node = await get_node(session, nearest_node.node_id)

    return campus_map.NearestNode(
        nearest_node=formatted_node,
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
        floor=node.floor,
        latitude=node.latitude,
        longitude=node.longitude,
    )

async def search_buildings_by_name(session, building_name):
    building_list = await campus_map_repository.get_building_by_name(session, building_name)
    search_result_list =[]

    for building in building_list:
        building: Building
        search_result = campus_map.BuildingDetail(
            name=building.name,
            display_name=building.display_name,
            building_id=building.building_id,
            building_code=building.building_code,
            aliases=building.aliases,
            area_name=building.area_name,
            available_floors=[floor.floor_number for floor in building.floors],
            boundaries=building.boundaries,
            entrance_node_id=building.entrance_node_id,
        )
        search_result_list.append(search_result)

    return search_result_list


async def get_building_detail(session, building_id):
    building = await campus_map_repository.get_building_by_id(session, building_id)

    if building is None:
        return None
    
    return campus_map.BuildingDetail(
        name=building.name,
        display_name=building.display_name,
        building_id=building.building_id,
        building_code=building.building_code,
        aliases=building.aliases,
        area_name=building.area_name,
        available_floors=[floor.floor_number for floor in building.floors],
        boundaries=building.boundaries,
        entrance_node_id=building.entrance_node_id,
    )

async def get_all_buildings(session):
    buildings = await campus_map_repository.get_all_buildings(session)
    search_result_list =[]

    for building in buildings:
        building: Building
        search_result = campus_map.BuildingDetail(
            name=building.name,
            display_name=building.display_name,
            building_id=building.building_id,
            building_code=building.building_code,
            aliases=building.aliases,
            area_name=building.area_name,
            available_floors=[floor.floor_number for floor in building.floors],
            boundaries=building.boundaries,
            entrance_node_id=building.entrance_node_id
        )
        search_result_list.append(search_result)

    return search_result_list
    

async def get_building_floors(session, building_id):
    building = await campus_map_repository.get_building_by_id(session, building_id)
    if building is None:
        return None 

    floor_list = await campus_map_repository.get_floors(session, building_id)
    search_result_list = []

    for floor in floor_list:
        floor: Floor
        search_result = campus_map.FloorDetail(
            floor_id=floor.floor_id,
            building_id=floor.building_id,
            floor_name=floor.floor_name,
            floor_number=floor.floor_number,
            geo_reference=floor.geo_reference,
            affine=floor.affine,
            image_url=floor.image_url,
            image_height=floor.image_height,
            image_width=floor.image_width,
        )
        search_result_list.append(search_result)

    return search_result_list

async def get_building_floor_by_number(session, building_id, floor_number):
    floor = await campus_map_repository.get_floor_by_number(session, building_id, floor_number)
    if floor is None:
        return None

    return campus_map.FloorDetail(
        floor_id=floor.floor_id,
        building_id=floor.building_id,
        floor_name=floor.floor_name,
        floor_number=floor.floor_number,
        geo_reference=floor.geo_reference,
        affine=floor.affine,
        image_url=floor.image_url,
        image_height=floor.image_height,
        image_width=floor.image_width,
    )
