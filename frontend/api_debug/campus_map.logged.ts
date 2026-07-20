export type NodeDetail = {
  node_id: string;
  name: string;
  node_type: string;
  building_id: string | null;
  floor: number;
  latitude: number;
  longitude: number;
};

export type NearestNode = {
  nearest_node: NodeDetail;
  distance_to_nearest_node: number;
};

export type ClosestNodeRequest = {
  latitude: number;
  longitude: number;
  floor: number;
};

export type EdgeDetail = {
  edge_id: string;
  from_node_id: string;
  to_node_id: string;
  mode: string;
  distance_m: number;
  estimated_seconds: number;
  instruction: string | null;
  geometry: [number, number][];
};

export type NodeEdges = {
  node_id: string;
  edge_list: EdgeDetail[];
};

export type SpecificEdge = {
  edge: EdgeDetail;
};

export type BuildingDetail = {
  name: string;
  display_name: string;
  building_id: string;
  building_code: string | null;
  aliases: string[];
  area_name: string | null;
  boundaries: {
    type: string;
    coordinates: [number, number][];
  };

  available_floors: number[];
  entrance_node_id: string | null;
  display_latitude: number;
  display_longitude: number;
};

export type AffineCoeff = [
  [number, number],
  [number, number],
  [number, number],
];

export type FloorDetail = {
  floor_id: number;
  building_id: string;
  floor_name: string;
  floor_number: number;

  geo_reference: number[][];
  affine: AffineCoeff;

  image_url: string;
  image_width: number;
  image_height: number;
};

export type Canteen = {
  location_id: string;
  halal_availability: boolean;
  stalls: string[];
};

const API_BASE_URL = "https://orbital-26.onrender.com";

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

export async function getClosestNode(
  request: ClosestNodeRequest,
): Promise<NearestNode> {
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

export async function getNodeDetails(node_id: string): Promise<NodeDetail> {
  const res = await debugFetch(
    `${API_BASE_URL}/campus-map/nodes/${encodeURIComponent(node_id)}`,
  );

  if (!res.ok) {
    throw new Error("Failed to get node details");
  }

  return res.json();
}
// theres other node/edge stuff available but not needed for now i think?

export async function getBuildingDetails(
  building_name: string,
): Promise<BuildingDetail[]> {
  const res = await debugFetch(
    `${API_BASE_URL}/campus-map/buildings?building_name=${encodeURIComponent(building_name)}`,
  );

  if (!res.ok) {
    throw new Error("Failed to get building details");
  }

  return res.json();
}

export async function getAllBuildingDetails(): Promise<BuildingDetail[]> {
  const res = await debugFetch(`${API_BASE_URL}/campus-map/buildings/all`);

  if (!res.ok) {
    throw new Error("Failed to get building details");
  }

  return res.json();
}

export async function getBuildingById(
  building_id: string,
): Promise<BuildingDetail> {
  const res = await debugFetch(
    `${API_BASE_URL}/campus-map/buildings/${encodeURIComponent(building_id)}`,
  );

  if (!res.ok) {
    throw new Error("Failed to get building details");
  }

  return res.json();
}

//to get all floors
export async function getBuildingFloors(
  building_id: string,
): Promise<FloorDetail[]> {
  const res = await debugFetch(
    `${API_BASE_URL}/campus-map/buildings/${encodeURIComponent(building_id)}/floors`,
  );

  if (!res.ok) {
    throw new Error("Failed to get floor details");
  }

  return res.json();
}

//to get specific floors
export async function getBuildingFloorByLevel(
  building_id: string,
  floorNumber: number,
): Promise<FloorDetail> {
  const res = await debugFetch(
    `${API_BASE_URL}/campus-map/buildings/${encodeURIComponent(building_id)}/floors/${floorNumber}`,
  );

  if (!res.ok) {
    throw new Error("Failed to get floor details");
  }

  return res.json();
}
