export type BusStopResponse = {
  bus_stop_id: string;
  name: string;
  node_id: string | null;
  latitude: number;
  longitude: number;

  available_buses: string[];
  bus_schedules: Record<string, number>;
};

export type BusResponse = {
  bus_number: string;
  bus_stops: string[];
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
      // throw new Error(`${method} ${url} failed with ${res.status}: ${text}`);
    }

    return res;
  } catch (err) {
    console.log(`[API NETWORK ERROR] ${method} ${url}`);
    console.log(err);
    throw err;
  }
}

export async function fetchBus(bus_number: string): Promise<BusResponse> {
  const res = await debugFetch(
    `${API_BASE_URL}/bus_service/bus?bus_number=${encodeURIComponent(bus_number)}`,
  );
  if (!res.ok) {
    throw new Error("Failed to fetch bus");
  }
  return res.json();
}

export async function fetchBusStopById(
  bus_stop_id: string,
): Promise<BusStopResponse> {
  const res = await debugFetch(
    `${API_BASE_URL}/bus_service/bus_stop/id/${bus_stop_id}`,
  );
  if (!res.ok) {
    throw new Error("Failed to fetch bus stop details");
  }
  return res.json();
}

export async function fetchBusStopByName(
  bus_stop_name: string,
): Promise<BusStopResponse> {
  const res = await debugFetch(
    `${API_BASE_URL}/bus_service/bus_stop/name/${bus_stop_name}`,
  );
  if (!res.ok) {
    throw new Error("Failed to fetch bus stop details");
  }
  return res.json();
}

export async function fetchAllBusStop(): Promise<BusStopResponse[]> {
  const res = await debugFetch(`${API_BASE_URL}/bus_service/bus_stop/all`);
  if (!res.ok) {
    throw new Error("Failed to fetch bus stop details");
  }
  return res.json();
}
