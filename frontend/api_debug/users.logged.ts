// import { RoutePlace } from "@/context/RouteContext";
import {
  recentlyVisitedLocations,
  sampleLocations,
  sampleSavedLocations,
} from "@/app/data/sampleLocations";
import { Location } from "../api/locations";

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

export type RecentlyVisitedResponse = {
  recentLocations: Location[];
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type UserDetail = {
  user_id: string;
  username: string;
  language: string;
  profile_settings: string[];
};
export type UserCreate = {
  username: string;
  password: string;
  language: string;
  profile_settings: string[];
};
export type UserUpdate = {
  username: string;
  password: string;
  new_username: string | null;
  new_password: string | null;
  language: string | null;
  profile_settings: string[] | null;
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

let mockSavedLocations = [...sampleSavedLocations];

// export async function getSavedLocations(
//   token: string,
// ): Promise<SavedLocationResponse> {
//   if (useMockAPI) {
//     return { savedLocations: [...mockSavedLocations] };
//   }

//   const res = await fetch(`${API_BASE_URL}/users/me/saved-locations`, {
//     method: "GET",
//     headers: getAuthHeaders(token),
//   });

//   if (!res.ok) {
//     throw new Error("Failed to get saved locations");
//   }

//   return res.json();
// }

// export async function saveLocation(
//   token: string,
//   request: SaveLocationRequest,
// ): Promise<SaveLocationResponse> {
//   if (useMockAPI) {
//     //add to sampleSavedLocations?
//     const locationToSave = sampleLocations.find(
//       (location) => location.id === request.locationId,
//     );
//     if (!locationToSave) {
//       throw new Error("Location not found");
//     }

//     const alreadySaved = mockSavedLocations.some(
//       (location) => location.id === request.locationId,
//     );
//     if (!alreadySaved) {
//       mockSavedLocations = [...mockSavedLocations, locationToSave];
//     }
//     return { savedLocation: locationToSave };
//   }

//   const res = await fetch(`${API_BASE_URL}/users/me/save-location`, {
//     method: "POST",
//     headers: getAuthHeaders(token),
//     body: JSON.stringify(request),
//   });

//   if (!res.ok) {
//     throw new Error("Failed to save location");
//   }

//   return res.json();
// }

// export async function deleteSavedLocation(
//   token: string,
//   locationId: string,
// ): Promise<DeleteSavedLocationResponse> {
//   if (useMockAPI) {
//     const existed = mockSavedLocations.some(
//       (location) => location.id === locationId,
//     );

//     mockSavedLocations = mockSavedLocations.filter(
//       (location) => location.id !== locationId,
//     );

//     return { deleted: existed };
//   }

//   const res = await fetch(
//     `${API_BASE_URL}/users/me/saved-locations/${locationId}`,
//     {
//       method: "DELETE",
//       headers: getAuthHeaders(token),
//     },
//   );

//   if (!res.ok) {
//     throw new Error("Failed to delete saved location");
//   }

//   return res.json();
// }

export async function getSavedLocations(
  userId: string,
): Promise<SaveLocationResponse[]> {
  const res = await debugFetch(`${API_BASE_URL}/users/${userId}/saves`);

  if (!res.ok) {
    throw new Error("Failed to fetch saved locations");
  }

  return res.json();
}

export async function saveLocation(
  userId: string,
  request: {
    location_id: string;
    purpose: string;
  },
): Promise<SaveLocationResponse> {
  const res = await debugFetch(`${API_BASE_URL}/users/${userId}/saves`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error("Failed to save location");
  }

  return res.json();
}

export async function deleteSavedLocation(
  userId: string,
  locationId: string,
): Promise<DeleteSavedLocationResponse> {
  const res = await debugFetch(
    `${API_BASE_URL}/users/${userId}/saves/${locationId}`,
    {
      method: "DELETE",
    },
  );

  if (!res.ok) {
    throw new Error("Failed to delete saved location");
  }

  return res.json();
}

export async function getRecentlyVisited(
  token: string,
): Promise<RecentlyVisitedResponse> {
  if (useMockAPI) {
    return { recentLocations: recentlyVisitedLocations };
  }

  const res = await debugFetch(`${API_BASE_URL}/users/me/recently-visited`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch recently visited locations");
  }

  return res.json();
}

//users CRUD API functions
export async function getUser(request: LoginRequest): Promise<UserDetail> {
  const res = await debugFetch(`${API_BASE_URL}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error("Failed to login");
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

export async function updateUser(request: UserUpdate): Promise<UserDetail> {
  const res = await debugFetch(`${API_BASE_URL}/users/update`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error("Failed to update user");
  }

  return res.json();
}

export async function deleteUser(
  request: LoginRequest,
): Promise<{ deleted: boolean }> {
  const res = await debugFetch(`${API_BASE_URL}/users`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error("Failed to delete user");
  }

  return res.json();
}
