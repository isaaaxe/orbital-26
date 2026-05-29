export type Node = {
  id: string;
  latitude: number;
  longitude: number;
  name: string;
};

export type RouteRequest = {
  startNodeId: string;
  endNodeId: string;
};

export type RouteResponse = {
  startNodeId: string;
  endNodeId: string;
  distanceMeters: number;
  nodes: Node[];
};

export type ClosestNodeRequest = {
  latitude: number;
  longitude: number;
};
export type RouteOptionType =
  | "Fastest"
  | "Walking only"
  | "Accessible"
  | "Carpark";

export type RouteOption = {
  id: string;
  optionType: RouteOptionType;
  title: string;
  description: string;
  distanceMeters: number;
  estimatedMinutes: number;
};

export type RouteOptionsRequest = {
  startLocationId: string;
  endLocationId: string;
};

export type RouteOptionsResponse = {
  options: RouteOption[];
};

const API_BASE_URL = "http://localhost:8000";
const useMockAPI = true;
import {
  closestNode,
  mockRoute,
  mockRoutev2,
  sampleRouteOptions,
} from "@/app/data/sampleLocations";

export async function fetchRoute(
  request: RouteRequest,
): Promise<RouteResponse> {
  //hard coded backend link for now

  if (useMockAPI) {
    return mockRoutev2;
  }

  const res = await fetch(`${API_BASE_URL}/routes/search`, {
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
): Promise<Node> {
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

export async function getRouteOptions(
  request: RouteOptionsRequest,
): Promise<RouteOptionsResponse> {
  if (useMockAPI) {
    return {
      options: sampleRouteOptions,
    };
  }
  const res = await fetch(`${API_BASE_URL}/routes/options`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error("Failed to get route options");
  }

  return res.json();
}
