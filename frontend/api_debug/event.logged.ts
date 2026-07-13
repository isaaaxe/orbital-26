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

export type EventResponse = {
  event_id: string;
  name: string;
  start_date: string;
  end_date: string;

  description: string;
  categories: string[];
  audiences: string[];

  image_url: string | null;
  event_url: string;
};

export async function getEvents(days: number): Promise<EventResponse[]> {
  const res = await debugFetch(`${API_BASE_URL}/events?date_range=${days}`);
  if (!res.ok) {
    throw new Error("Failed to get events");
  }
  return res.json();
}
