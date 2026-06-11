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

function getAuthHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export type AddRecentLocationRequest = {
  location_id: string;
};

export type RecentLocationResponse = {
  recent_id: number;
  location_id: string;
  name: string;
  time: string;
  description: string;
  display_name: string;
  location_type: string;
  building_code: string | null;
  area_name: string;
};

export type DeleteResponse = {
  deleted: boolean;
};
export async function getRecentlyVisited(
  token: string,
): Promise<RecentLocationResponse[]> {
  const res = await debugFetch(`${API_BASE_URL}/users/me/recent_locations`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch recently visited locations");
  }

  return res.json();
}

export async function addRecentlyVisited(
  token: string,
  request: AddRecentLocationRequest,
): Promise<RecentLocationResponse> {
  const res = await debugFetch(`${API_BASE_URL}/users/me/recent_locations`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error("Failed to add location to recently visited list");
  }

  return res.json();
}

export async function deleteLocationRecentlyVisited(
  token: string,
  request: AddRecentLocationRequest,
): Promise<DeleteResponse> {
  const res = await debugFetch(
    `${API_BASE_URL}/users/me/recent_locations/one`,
    {
      method: "DELETE",
      headers: getAuthHeaders(token),
      body: JSON.stringify(request),
    },
  );

  if (!res.ok) {
    throw new Error("Failed to delete location from recently visited list");
  }

  return res.json();
}

export async function clearRecentlyVisited(
  token: string,
): Promise<DeleteResponse> {
  const res = await debugFetch(
    `${API_BASE_URL}/users/me/recent_locations/all`,
    {
      method: "DELETE",
      headers: getAuthHeaders(token),
    },
  );

  if (!res.ok) {
    throw new Error("Failed to clear recently visited list");
  }

  return res.json();
}
