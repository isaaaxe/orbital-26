import { RoutePlace } from "@/context/RouteContext";

const API_BASE_URL = "http://localhost:8000";
const useMockAPI = true

export type SaveLocationRequest = {
    locationId: string;
}

export type SaveLocationResponse = {
    savedLocation: RoutePlace
}

export type SavedLocationResponse = {
    savedLocations: RoutePlace[];
}

export type DeleteSavedLocationResponse = {
    deleted: boolean;
}

export type RecentlyVisitedResponse = {
    recentLocations: RoutePlace[];
}

function getAuthHeaders(token: string) {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    }
}
import { recentlyVisitedLocations, sampleLocations, sampleSavedLocations } from "@/app/data/sampleLocations";
let mockSavedLocations = [...sampleSavedLocations]

export async function getSavedLocations(token: string): Promise<SavedLocationResponse> {

  if (useMockAPI) {
    return {savedLocations: [...mockSavedLocations]}
  }


  const res = await fetch(`${API_BASE_URL}/users/me/saved-locations`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });

  if (!res.ok) {
    throw new Error("Failed to get saved locations");
  }

  return res.json();
}

export async function saveLocation(
    token: string,
    request: SaveLocationRequest
): Promise<SaveLocationResponse> {

    if (useMockAPI) {
        //add to sampleSavedLocations?
        const locationToSave = sampleLocations.find(
            (location) => location.id === request.locationId
        )
        if (!locationToSave) {
            throw new Error("Location not found")
        }

        const alreadySaved = mockSavedLocations.some(
            (location) => location.id === request.locationId
        )
        if (!alreadySaved) {
            mockSavedLocations = [...mockSavedLocations, locationToSave]
        }
        return {savedLocation: locationToSave}
    }
    
    const res = await fetch(`${API_BASE_URL}/users/me/save-location`, {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify(request),
    })


    if (!res.ok) {
        throw new Error("Failed to save location")
    }

    return res.json();
}

export async function deleteSavedLocation(
  token: string,
  locationId: string
): Promise<DeleteSavedLocationResponse> {

  if (useMockAPI) {
    const existed = mockSavedLocations.some(
      (location) => location.id === locationId
    );

    mockSavedLocations = mockSavedLocations.filter(
      (location) => location.id !== locationId
    );

    return { deleted: existed };
  }


  const res = await fetch(
    `${API_BASE_URL}/users/me/saved-locations/${locationId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(token),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to delete saved location");
  }

  return res.json();
}

export async function getRecentlyVisited(
  token: string
): Promise<RecentlyVisitedResponse> {

    if (useMockAPI) {
        return {recentLocations: recentlyVisitedLocations}
    }


  const res = await fetch(`${API_BASE_URL}/users/me/recently-visited`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch recently visited locations");
  }

  return res.json();
}