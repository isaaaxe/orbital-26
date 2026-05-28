import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { searchLocations, SearchLocationsResponse } from "@/api/locations";
import {
  deleteSavedLocation,
  getRecentlyVisited,
  getSavedLocations,
  saveLocation,
} from "@/api/users";

export function useLocationSearchQuery(query: string) {
  return useQuery<SearchLocationsResponse, Error>({
    queryKey: ["locations", "search", query],
    queryFn: () => searchLocations(query),
    enabled: query.trim().length >= 2,
  });
}

export function useSavedLocationsQuery(token?: string) {
  return useQuery({
    queryKey: ["savedLocations", token],
    queryFn: () => getSavedLocations(token!),
    enabled: !!token,
  });
}

export function useSaveLocationMutation(token?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (locationId: string) =>
      saveLocation(token!, {
        locationId,
      }),

    onSuccess: (data) => {
      queryClient.setQueryData(["savedLocations", token], (oldData: any) => {
        if (!oldData) {
          return {
            savedLocations: [data.savedLocation],
          };
        }

        const alreadySaved = oldData.savedLocations.some(
          (location: any) => location.id === data.savedLocation.id,
        );

        if (alreadySaved) {
          return oldData;
        }

        return {
          ...oldData,
          savedLocations: [...oldData.savedLocations, data.savedLocation],
        };
      });
    },
  });
}

export function useDeleteSavedLocationMutation(token?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (locationId: string) => deleteSavedLocation(token!, locationId),

    onSuccess: (_, locationId) => {
      queryClient.setQueryData(["savedLocations", token], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          savedLocations: oldData.savedLocations.filter(
            (location: any) => location.id !== locationId,
          ),
        };
      });
    },
  });
}

export function useRecentlyVisitedQuery(token?: string) {
  return useQuery({
    queryKey: ["recentlyVisited", token],
    queryFn: () => getRecentlyVisited(token!),
    enabled: !!token,
  });
}
