import { Location } from "../api/locations";

export type RouteRequest = {
  start_id: string;
  destination_id: string;
  mode: string[];
};

export type RouteStep = {
  step_number: number;
  transport_mode: string;
  step_instruction: string;
  distance_for_step: number;
  estimated_seconds: number;
  from_name: string | null;
  to_name: string | null;
};

export type RouteResponse = {
  mode: string;
  total_distance: number;
  total_estimated_seconds: number;
  steps: RouteStep[];
  path_coordinates: [number, number][];
};

export type ClosestNodeRequest = {
  latitude: number;
  longitude: number;
  floor: number;
};

export type NodeDetail = {
  node_id: string;
  name: string;
  node_type: string;
  building_id: string;
  building_code: string;
  floor: number;
  latitude: number;
  longitude: number;
};

export type NearestNode = {
  nearest_node: NodeDetail;
  distance_to_nearest_node: number;
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
      throw new Error(`${method} ${url} failed with ${res.status}: ${text}`);
    }

    return res;
  } catch (err) {
    console.log(`[API NETWORK ERROR] ${method} ${url}`);
    console.log(err);
    throw err;
  }
}

import { closestNode, mockRoutev2 } from "@/app/data/sampleLocations";

export async function fetchRoutes(
  request: RouteRequest,
): Promise<RouteResponse[]> {
  //hard coded backend link for now

  if (useMockAPI) {
    return [mockRoutev2];
  }

  const res = await debugFetch(`${API_BASE_URL}/routes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch route");
  }

  return res.json();
}

export async function getClosestNode(
  request: ClosestNodeRequest,
): Promise<NearestNode> {
  // if (useMockAPI) {
  //   return closestNode;
  // }
  const param = new URLSearchParams({
    latitude: String(request.latitude),
    longitude: String(request.longitude),
    floor: String(request.floor),
  });

  const res = await debugFetch(
    `${API_BASE_URL}/campus-map/nodes/nearest?${param.toString()}`,
  );

  if (!res.ok) {
    throw new Error("Failed to get closest node");
  }

  return res.json();
}
