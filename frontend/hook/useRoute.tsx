import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ClosestNodeRequest,
  fetchRoutes,
  getClosestNode,
  RouteResponse,
} from "@/api_debug/routes.logged";

export function useRouteQuery(startNodeId?: string, endNodeId?: string) {
  return useQuery<RouteResponse[]>({
    queryKey: ["route", startNodeId, endNodeId],
    queryFn: () =>
      fetchRoutes({
        start_id: startNodeId!,
        destination_id: endNodeId!,
        mode: ["fastest"], //hard coded for now
      }),
    enabled: !!startNodeId && !!endNodeId,
  });
}

export function useClosestNodeMutation() {
  return useMutation({
    mutationFn: getClosestNode,
  });
}

// export function useRouteOptions(startNodeId?: string, endNodeId?: string) {
//   return useQuery({
//     queryKey: ["routeOptions", startNodeId, endNodeId],
//     queryFn: () =>
//       getRouteOptions({
//         startLocationId: startNodeId!,
//         endLocationId: endNodeId!,
//       }),

//     enabled: !!startNodeId && !!endNodeId,
//   });
// }
