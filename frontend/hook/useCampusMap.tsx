import {
  BuildingDetail,
  FloorDetail,
  getAllBuildingDetails,
  getBuildingById,
  getBuildingDetails,
  getBuildingFloorByLevel,
  getBuildingFloors,
  getNodeDetails,
  NodeDetail,
} from "@/api_debug/campus_map.logged";
import { useQuery } from "@tanstack/react-query";

//getNodeDetails
export function useNodeDetailsById(node_id: string) {
  return useQuery<NodeDetail, Error>({
    queryKey: ["node_details", node_id],
    queryFn: () => getNodeDetails(node_id),
    enabled: !!node_id,
  });
}

//getBuildingDetails
// export function useBuildingDetailsByName(building_name: string) {
//   return useQuery<BuildingDetail[], Error>({
//     queryKey: ["building_detail", building_name],
//     queryFn: () => getBuildingDetails(building_name),
//     enabled: !!building_name
//   });
// }

//getAllBuildingDetails
export function useAllBuildingDetails() {
  return useQuery<BuildingDetail[], Error>({
    queryKey: ["all_building_detail"],
    queryFn: () => getAllBuildingDetails(),
  });
}
//getBuildingId
export function useBuildingDetailsById(building_id: string) {
  return useQuery<BuildingDetail, Error>({
    queryKey: ["building_detail", building_id],
    queryFn: () => getBuildingById(building_id),
    enabled: !!building_id,
  });
}
//getBuildingFloors
export function useBuildingFloors(building_id: string) {
  return useQuery<FloorDetail[], Error>({
    queryKey: ["building_floors", building_id],
    queryFn: () => getBuildingFloors(building_id),
    enabled: !!building_id,
  });
}
//getBuildingFloorByLevel
export function useBuildingFloorsByLevel(
  building_id: string,
  floorNumber: number,
) {
  return useQuery<FloorDetail, Error>({
    queryKey: ["building_floors", building_id, floorNumber],
    queryFn: () => getBuildingFloorByLevel(building_id, floorNumber),
    enabled: !!building_id && !!floorNumber,
  });
}
