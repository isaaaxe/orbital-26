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

export type SaveLocationRequest = {
  locationId: string;
  purpose: string | null;
};

export type SaveLocationResponse = {
  save_id: number;
  location_id: string;
  name: string;
  display_name: string;
  location_type: string;
  building_code: string | null;
  area_name: string | null;

  purpose: string | null;
};

export type DeleteSavedLocationResponse = {
  deleted: boolean;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type UserDetail = {
  user_id: string;
  username: string;
  language: string;
  pace_factor: number;
  shelter_pref: number;
};
export type UserCreate = {
  username: string;
  password: string;
  language: string;
  pace_factor: number;
  shelter_pref: number;
};
export type UserUpdate = {
  new_username: string | null;
  new_password: string | null;
  language: string | null;
  pace_factor: number | null;
  shelter_pref: number | null;
};

export type UserDeleted = {
  deleted: boolean;
};

function getAuthHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getSavedLocations(
  token: string,
): Promise<SaveLocationResponse[]> {
  const res = await debugFetch(`${API_BASE_URL}/users/me/saves`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch saved locations");
  }

  return res.json();
}

export async function saveLocation(
  token: string,
  request: {
    location_id: string;
    purpose: string;
  },
): Promise<SaveLocationResponse> {
  const res = await debugFetch(`${API_BASE_URL}/users/me/saves`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error("Failed to save location");
  }

  return res.json();
}

export async function deleteSavedLocation(
  token: string,
  locationId: string,
): Promise<DeleteSavedLocationResponse> {
  const res = await debugFetch(`${API_BASE_URL}/users/me/saves/${locationId}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });

  if (!res.ok) {
    throw new Error("Failed to delete saved location");
  }

  return res.json();
}

//users CRUD API functions
export async function getUser(token: string): Promise<UserDetail> {
  const res = await debugFetch(`${API_BASE_URL}/users/me`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });

  if (!res.ok) {
    throw new Error("Failed to retrieve user");
  }

  return res.json();
}

export async function createUser(request: UserCreate): Promise<UserDetail> {
  const res = await debugFetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error("Failed to create user");
  }

  return res.json();
}

export async function updateUser(
  token: string,
  request: UserUpdate,
): Promise<UserDetail> {
  const res = await debugFetch(`${API_BASE_URL}/users/update`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error("Failed to update user");
  }

  return res.json();
}

export async function deleteUser(token: string): Promise<{ deleted: boolean }> {
  const res = await debugFetch(`${API_BASE_URL}/users`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });

  if (!res.ok) {
    throw new Error("Failed to delete user");
  }

  return res.json();
}
