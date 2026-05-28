import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ClosestNodeRequest,
  fetchRoute,
  getClosestNode,
  getRouteOptions,
} from "@/api/routes";

export function useRouteQuery(startNodeId?: string, endNodeId?: string) {
  return useQuery({
    queryKey: ["route", startNodeId, endNodeId],
    queryFn: () =>
      fetchRoute({
        startNodeId: startNodeId!,
        endNodeId: endNodeId!,
      }),
    enabled: !!startNodeId && !!endNodeId,
  });
}

export function useClosestNodeMutation() {
  return useMutation({
    mutationFn: getClosestNode,
  });
}

export function useRouteOptions(startNodeId?: string, endNodeId?: string) {
  return useQuery({
    queryKey: ["routeOptions", startNodeId, endNodeId],
    queryFn: () =>
      getRouteOptions({
        startLocationId: startNodeId!,
        endLocationId: endNodeId!,
      }),

    enabled: !!startNodeId && !!endNodeId,
  });
}
