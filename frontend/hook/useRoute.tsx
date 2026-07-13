import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchRoutes, RouteResponse } from "@/api_debug/routes.logged";

import { getClosestNode } from "@/api_debug/campus_map.logged";

export function useRouteQuery(
  startNodeId?: string,
  endNodeId?: string,
  token?: string | null,
) {
  return useQuery<RouteResponse[]>({
    queryKey: [
      "route",
      startNodeId,
      endNodeId,
      token ? "authenticated" : "anon",
    ],
    queryFn: () =>
      fetchRoutes(
        {
          start_id: startNodeId!,
          destination_id: endNodeId!,
          mode: ["fastest", "sheltered", "accessible"], //hard coded for now
        },
        token,
      ),
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
