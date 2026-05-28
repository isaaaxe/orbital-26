import type { RoutePlace } from "@/context/RouteContext";
import { sampleLocations } from "@/app/data/sampleLocations";

export type SearchLocationsResponse = {
  locations: RoutePlace[];
};

const API_BASE_URL = "http://localhost:8000";

const useMockAPI = true;

export async function searchLocations(
  query: string,
): Promise<SearchLocationsResponse> {
  if (useMockAPI) {
    const lowerQuery = query.trim().toLowerCase();
    const locations = sampleLocations.filter((location) =>
      location.name.toLowerCase().includes(lowerQuery),
    );
    return { locations };
  }

  const res = await fetch(
    `${API_BASE_URL}/locations/search?q=${encodeURIComponent(query)}`,
  );

  if (!res.ok) {
    throw new Error("Failed to search locations");
  }

  return res.json();
}
