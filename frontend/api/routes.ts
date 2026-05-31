import { Location } from "./locations";

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
};

const API_BASE_URL = "http://localhost:8000";
const useMockAPI = false;
import { closestNode, mockRoutev2 } from "@/app/data/sampleLocations";

export async function fetchRoutes(
  request: RouteRequest,
): Promise<RouteResponse[]> {
  //hard coded backend link for now

  if (useMockAPI) {
    return [mockRoutev2];
  }

  const res = await fetch(`${API_BASE_URL}/routes`, {
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
): Promise<Location> {
  if (useMockAPI) {
    return closestNode;
  }

  const res = await fetch(`${API_BASE_URL}/nodes/closest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error("Failed to get closest node");
  }

  return res.json();
}
