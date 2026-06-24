import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchLocationDetail,
  fetchLocationDetailByType,
  LocationDetail,
  searchLocations,
} from "@/api_debug/locations.logged"; //rmb to change back
import {
  deleteSavedLocation,
  getSavedLocations,
  saveLocation,
} from "@/api_debug/users.logged";

import type { SaveLocationRequest } from "@/api_debug/users.logged";

export function useLocationSearchQuery(query: string) {
  return useQuery<LocationDetail[], Error>({
    queryKey: ["locations", "search", query],
    queryFn: () => searchLocations(query),
    enabled: query.trim().length >= 0,
  });
}

export function useGetLocationDetails(locationId?: string | null) {
  return useQuery<LocationDetail>({
    queryKey: ["location-detail", locationId],
    queryFn: () => fetchLocationDetail(locationId!),
    enabled: !!locationId,
  });
}

export function useGetLocationDetailsByType(location_type: string) {
  return useQuery<LocationDetail[]>({
    queryKey: ["locations-type", location_type],
    queryFn: () => fetchLocationDetailByType(location_type),
    enabled: !!location_type,
  });
}

export function useSavedLocationsQuery(token?: string | null) {
  return useQuery({
    queryKey: ["savedLocations", token],
    queryFn: () => {
      if (!token) {
        throw new Error("Missing auth token");
      }
      return getSavedLocations(token);
    },
    enabled: !!token,
  });
}

export function useSaveLocationMutation(token?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ locationId, purpose }: SaveLocationRequest) => {
      if (!token) {
        throw new Error("Missing auth token");
      }
      return saveLocation(token!, {
        location_id: locationId,
        purpose: purpose ?? "",
      });
    },
    onSuccess: (newSave) => {
      queryClient.invalidateQueries({
        queryKey: ["savedLocations", token],
      });
    },
  });
}

export function useDeleteSavedLocationMutation(token?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (locationId: string) => {
      if (!token) {
        throw new Error("Missing auth token");
      }
      return deleteSavedLocation(token, locationId);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["savedLocations", token],
      });
    },
  });
}

export function useSavedLocations(token?: string | null) {
  const savedLocationsQuery = useSavedLocationsQuery(token);
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
