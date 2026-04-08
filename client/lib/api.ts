// src/lib/apiClient.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:9898";

export interface ApiError {
  message: string;
  status: number;
}

let currentAccessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  currentAccessToken = token;
};

const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};
export const getAccessToken = () => currentAccessToken;

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout = 8000,
) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return res;
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw {
        message: "Request timed out. Please try again.",
        status: 408,
      } as ApiError;
    }
    throw { message: "Cannot connect to server.", status: 0 } as ApiError;
  } finally {
    clearTimeout(id);
  }
}

async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
  isPrivate = true,
): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;

  const csrfToken = getCookie("csrf_token"); // Ensure this string matches
  // Clone options and set default headers
  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  // AUTOMATIC CSRF PROTECTION: Attach token to mutating requests
  const method = options.method?.toUpperCase() || "GET";
  if (["POST", "PUT", "DELETE", "PATCH"].includes(method) && csrfToken) {
    config.headers = {
      ...config.headers,
      "X-CSRF-Token": csrfToken,
    };
  }

  if (isPrivate) {
    config.credentials = "include"; // Tells browser to send the HttpOnly refresh cookie

    if (currentAccessToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${currentAccessToken}`,
      };
    }
  }

  let res = await fetchWithTimeout(url, config);

  if (
    isPrivate &&
    res.status === 401 &&
    endpoint !== "/api/v1/auth/login" &&
    endpoint !== "/api/v1/auth/refresh"
  ) {
    try {
      const refreshRes = await fetchWithTimeout(
        `${API_BASE_URL}/api/v1/auth/refresh`,
        {
          method: "POST",
          credentials: "include", // Send the secure cookie!
        },
      );

      if (!refreshRes.ok) throw new Error("Refresh failed");

      const refreshData = await refreshRes.json();

      setAccessToken(refreshData.access_token);

      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${currentAccessToken}`,
      };

      res = await fetchWithTimeout(url, config);
    } catch (refreshError) {
      setAccessToken(null);

      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw {
        message: "Session expired. Please log in again.",
        status: 401,
      } as ApiError;
    }
  }

  let data;
  try {
    if (res.status !== 204) {
      data = await res.json();
    }
  } catch {
    throw {
      message: "Invalid server response",
      status: res.status,
    } as ApiError;
  }

  if (!res.ok) {
    throw {
      message: data?.message || "An error occurred.",
      status: res.status,
    } as ApiError;
  }

  return data;
}

export const apiClient = {
  get: (endpoint: string) => apiFetch(endpoint, { method: "GET" }, true),

  post: (endpoint: string, body: any) =>
    apiFetch(endpoint, { method: "POST", body: JSON.stringify(body) }, true),

  put: (endpoint: string, body: any) =>
    apiFetch(endpoint, { method: "PUT", body: JSON.stringify(body) }, true),

  delete: (endpoint: string) => apiFetch(endpoint, { method: "DELETE" }, true),

  publicGet: (endpoint: string) => apiFetch(endpoint, { method: "GET" }, false),

  publicPost: (endpoint: string, body: any) =>
    apiFetch(endpoint, { method: "POST", body: JSON.stringify(body) }, false),

  login: async (email: string, password: string) => {
    const body = new URLSearchParams();
    body.append("username", email);
    body.append("password", password);

    // Login is technically a "public" route because we don't have a token yet,
    // but we use form-urlencoded for FastAPI's OAuth2 dependencies.
    const res = await fetchWithTimeout(
      `${API_BASE_URL}/api/v1/biskota/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body,
        credentials: "include", // Required so the browser saves the set-cookie header!
      },
    );

    let data;
    try {
      data = await res.json();
    } catch {
      throw {
        message: "Invalid server response",
        status: res.status,
      } as ApiError;
    }

    if (!res.ok) {
      throw {
        message: data?.message || "Login failed.",
        status: res.status,
      } as ApiError;
    }

    // Save the new token directly into memory!
    if (data && data.access_token) {
      setAccessToken(data.access_token);
    }

    return data;
  },

  logout: async () => {
    // 1. Clear frontend memory
    setAccessToken(null);

    // 2. Tell backend to invalidate/delete the HttpOnly cookie (Optional but recommended)
    try {
      // Assuming you create a /logout endpoint on FastAPI that deletes the cookie
      // await fetchWithTimeout(`${API_BASE_URL}/api/v1/auth/logout`, { method: "POST", credentials: "include" });
    } catch (e) {
      console.warn("Backend logout failed, but frontend is cleared.");
    }

    // 3. Redirect
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  },
};
