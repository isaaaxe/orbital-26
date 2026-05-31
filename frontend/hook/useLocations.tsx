import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchLocationDetail,
  Location,
  LocationDetail,
  searchLocations,
} from "@/api_debug/locations.logged"; //rmb to change back
import {
  deleteSavedLocation,
  getRecentlyVisited,
  getSavedLocations,
  saveLocation,
} from "@/api_debug/users.logged";

import type {
  SaveLocationRequest,
  DeleteSavedLocationResponse,
} from "@/api_debug/users.logged";

//when we can accept token headers
// export function useSavedLocationsQuery(token?: string) {
//   return useQuery({
//     queryKey: ["savedLocations", token],
//     queryFn: () => getSavedLocations(token!),
//     enabled: !!token,
//   });
// }

// export function useSaveLocationMutation(token?: string) {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (locationId: string, purpose: string) =>
//       saveLocation(token!, {
//         locationId,
//       }),

//     onSuccess: (data) => {
//       queryClient.setQueryData(["savedLocations", token], (oldData: any) => {
//         if (!oldData) {
//           return {
//             savedLocations: [data.savedLocation],
//           };
//         }

//         const alreadySaved = oldData.savedLocations.some(
//           (location: any) => location.id === data.savedLocation.id,
//         );

//         if (alreadySaved) {
//           return oldData;
//         }

//         return {
//           ...oldData,
//           savedLocations: [...oldData.savedLocations, data.savedLocation],
//         };
//       });
//     },
//   });
// }

// export function useDeleteSavedLocationMutation(token?: string) {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (locationId: string) => deleteSavedLocation(token!, locationId),

//     onSuccess: (_, locationId) => {
//       queryClient.setQueryData(["savedLocations", token], (oldData: any) => {
//         if (!oldData) return oldData;

//         return {
//           ...oldData,
//           savedLocations: oldData.savedLocations.filter(
//             (location: any) => location.id !== locationId,
//           ),
//         };
//       });
//     },
//   });
// }

// export function useRecentlyVisitedQuery(token?: string) {
//   return useQuery({
//     queryKey: ["recentlyVisited", token],
//     queryFn: () => getRecentlyVisited(token!),
//     enabled: !!token,
//   });
// }

export function useLocationSearchQuery(query: string) {
  return useQuery<Location[], Error>({
    queryKey: ["locations", "search", query],
    queryFn: () => searchLocations(query),
    enabled: query.trim().length >= 2,
  });
}

export function useGetLocationDetails(locationId?: string | null) {
  return useQuery<LocationDetail>({
    queryKey: ["location-detail", locationId],
    queryFn: () => fetchLocationDetail(locationId!),
    enabled: !!locationId,
  });
}

export function useSavedLocationsQuery(userId?: string) {
  return useQuery({
    queryKey: ["savedLocations", userId],
    queryFn: () => getSavedLocations(userId!),
    enabled: !!userId,
  });
}

export function useSaveLocationMutation(userId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ locationId, purpose }: SaveLocationRequest) =>
      saveLocation(userId!, {
        location_id: locationId,
        purpose: purpose ?? "",
      }),

    onSuccess: (newSave) => {
      queryClient.invalidateQueries({
        queryKey: ["savedLocations", userId],
      });
    },
  });
}

export function useDeleteSavedLocationMutation(userId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (locationId: string) =>
      deleteSavedLocation(userId!, locationId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["savedLocations", userId],
      });
    },
  });
}

export function useSavedLocations(userId?: string) {
  const savedLocationsQuery = useSavedLocationsQuery(userId);
  const savedLocations = savedLocationsQuery.data ?? [];

  function isLocationSaved(locationId: string) {
    return savedLocations.some((save) => save.location_id === locationId);
  }

  function getSaveIdByLocationId(locationId: string) {
    return savedLocations.find((save) => save.location_id === locationId)
      ?.location_id;
  }
  return {
    savedLocations,
    isLoading: savedLocationsQuery.isLoading,
    error: savedLocationsQuery.error,
    isLocationSaved,
    getSaveIdByLocationId,
  };
}

export function useRecentlyVisitedQuery(userId?: string) {
  return useQuery({
    queryKey: ["recentlyVisited", userId],
    queryFn: () => getRecentlyVisited(userId!),
    enabled: !!userId,
  });
}
