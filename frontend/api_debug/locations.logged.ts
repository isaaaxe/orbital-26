// import type { RoutePlace } from "@/context/RouteContext";
import { sampleLocations } from "@/app/data/sampleLocations";

export type Location = {
  id: string;
  name: string;
  display_name: string;
  location_type: string;
  building_code: string | null;
  area_name: string | null;
  description: string | null;
};

export type LocationDetail = {
  id: string;
  name: string;
  display_name: string;
  aliases: string[];
  location_type: string;
  description: string | null;

  building_code: string | null;
  building_name: string | null;
  floor: number | null;
  available_floors: number[];

  area_name: string | null;
  latitude: number | null;
  longitude: number | null;
  nearest_node_id: string | null;
  nearest_bus_stop_id: string | null;

  landmark_hint: string | null;
  arrival_instruction: string | null;
};

const API_BASE_URL = "https://orbital-26.onrender.com";

const useMockAPI = false;

async function debugFetch(url: string, options?: RequestInit) {
  const method = options?.method ?? "GET";

  console.log(`[API REQUEST] ${method} ${url}`);

  if (options?.body) {
    console.log("[API REQUEST BODY]", options.body);
  }

  try {
    const res = await fetch(url, options);

    console.log(
      `[API RESPONSE] ${res.status} ${res.statusText} ${method} ${url}`,
    );

    if (!res.ok) {
      const text = await res.text();
      console.log("[API ERROR BODY]", text);
      // throw new Error(`${method} ${url} failed with ${res.status}: ${text}`);
    }

    return res;
  } catch (err) {
    console.log(`[API NETWORK ERROR] ${method} ${url}`);
    console.log(err);
    throw err;
  }
}

export async function searchLocations(query: string): Promise<Location[]> {
  if (useMockAPI) {
    const lowerQuery = query.trim().toLowerCase();
    const locations = sampleLocations.filter((location) =>
      location.name.toLowerCase().includes(lowerQuery),
    );
    return locations;
  }

  const res = await debugFetch(
    `${API_BASE_URL}/locations/search?q=${encodeURIComponent(query)}`,
  );

  if (!res.ok) {
    throw new Error("Failed to search locations");
  }

  return res.json();
}

export async function fetchLocationDetail(
  locationId: string,
): Promise<LocationDetail> {
  const res = await debugFetch(
    `${API_BASE_URL}/locations/${encodeURIComponent(locationId)}`,
  );
  if (!res.ok) {
    throw new Error("Failed to fetch location detail");
  }
  return res.json();
}
