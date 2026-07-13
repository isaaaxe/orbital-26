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
  buildings_passed_by_id: (string | null)[];
  floor_transition: number[];
};

export type RouteResponse = {
  mode: string;
  total_distance: number;
  total_estimated_seconds: number;
  steps: RouteStep[];
  path_coordinates: [number, number][];
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

export async function fetchRoutes(
  request: RouteRequest,
  token?: string | null,
): Promise<RouteResponse[]> {
  const res = await debugFetch(`${API_BASE_URL}/routes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch route");
  }

  return res.json();
}
