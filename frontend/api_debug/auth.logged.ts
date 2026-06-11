export type LoginRequest = {
  username: string;
  password: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
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

export async function login(request: LoginRequest): Promise<TokenResponse> {
  const formData = new URLSearchParams();
  formData.append("username", request.username);
  formData.append("password", request.password);

  const res = await debugFetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  if (!res.ok) {
    throw new Error("Failed to login");
  }

  return res.json();
}
