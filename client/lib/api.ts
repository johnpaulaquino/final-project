// src/lib/apiClient.ts

export interface ApiError {
  message: string;
  status: number;
}

// Ensure this is set to "/api-proxy" in your .env
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_INTERNAL_URL;

let currentAccessToken: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

export const setAccessToken = (token: string | null) => {
  currentAccessToken = token;
};
export const getAccessToken = () => currentAccessToken;

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) =>
    error ? prom.reject(error) : prom.resolve(token as string),
  );
  failedQueue = [];
};

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout = 8000,
) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err: any) {
    throw {
      message:
        err.name === "AbortError"
          ? "Request timed out."
          : "Cannot connect to server.",
      status: err.name === "AbortError" ? 408 : 0,
    } as ApiError;
  } finally {
    clearTimeout(id);
  }
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
  isPrivate = true,
): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;
  const isFormData = options.body instanceof FormData;

  const config: RequestInit = {
    ...options,
    credentials: "include",
    headers: {
      ...(!isFormData && { "Content-Type": "application/json" }),
      ...options.headers,
    },
  };

  // Attach token from memory if it exists
  if (isPrivate && currentAccessToken) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${currentAccessToken}`,
    };
  }

  let res = await fetchWithTimeout(url, config);

  // Intercept 401 Unauthorized
  if (
    isPrivate &&
    res.status === 401 &&
    endpoint !== "/auth/login" &&
    endpoint !== "/auth/refresh-token"
  ) {
    if (isRefreshing) {
      try {
        const newToken = await new Promise<string>((resolve, reject) =>
          failedQueue.push({ resolve, reject }),
        );
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${newToken}`,
        };
        res = await fetchWithTimeout(url, config);
      } catch (err) {
        throw err;
      }
    } else {
      isRefreshing = true;
      try {
        const refreshRes = await fetchWithTimeout(`/api/auth/refresh`, {
          method: "POST",
        });
        if (!refreshRes.ok) throw new Error("Refresh failed");

        const refreshData = await refreshRes.json();

        // Update memory token
        setAccessToken(refreshData.access_token);
        processQueue(null, refreshData.access_token);

        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${refreshData.access_token}`,
        };
        res = await fetchWithTimeout(url, config);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);

        // Tell Next.js to wipe cookies on failure
        await fetchWithTimeout(`/api/auth/logout`, { method: "POST" }).catch(
          () => {},
        );

        if (typeof window !== "undefined" && window.location.pathname !== "/") {
          window.location.href = "/?clear=1";
        }
        throw {
          message: "Session expired. Please log in again.",
          status: 401,
        } as ApiError;
      } finally {
        isRefreshing = false;
      }
    }
  }

  let data;
  try {
    if (res.status !== 204) data = await res.json();
  } catch {
    throw {
      message: "Invalid server response",
      status: res.status,
    } as ApiError;
  }

  if (!res.ok)
    throw {
      message: data?.detail || data?.message || "An error occurred.",
      status: res.status,
    } as ApiError;
  return data;
}

export const apiClient = {
  get: (endpoint: string) => apiFetch(endpoint, { method: "GET" }, true),
  post: (endpoint: string, body: any) =>
    apiFetch(
      endpoint,
      {
        method: "POST",
        body: body instanceof FormData ? body : JSON.stringify(body),
      },
      true,
    ),
  put: (endpoint: string, body: any) =>
    apiFetch(
      endpoint,
      {
        method: "PUT",
        body: body instanceof FormData ? body : JSON.stringify(body),
      },
      true,
    ),
  patch: (endpoint: string, body: any) =>
    apiFetch(
      endpoint,
      {
        method: "PATCH",
        body: body instanceof FormData ? body : JSON.stringify(body),
      },
      true,
    ),
  delete: (endpoint: string) => apiFetch(endpoint, { method: "DELETE" }, true),

  publicGet: (endpoint: string) => apiFetch(endpoint, { method: "GET" }, false),
  publicPost: (endpoint: string, body: any) =>
    apiFetch(endpoint, { method: "POST", body: JSON.stringify(body) }, false),

  // 🚀 LOGIN: Hits the Next.js Bridge
  login: async (email: string, password: string) => {
    const res = await fetch(`/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    let data;
    try {
      data = await res.json();
    } catch {
      throw {
        message: "Invalid server response",
        status: res.status,
      } as ApiError;
    }
    if (!res.ok)
      throw {
        message: data?.error || data?.message || "Login failed.",
        status: res.status,
      } as ApiError;

    // Save token to memory (Cookies are already handled by the server!)
    if (data?.access_token) setAccessToken(data.access_token);
    return data;
  },

  // SIGNUP: Hits the Next.js Bridge
  signup: async (bodyData: any) => {
    const res = await fetch(`/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData),
    });

    let data;
    try {
      data = await res.json();
    } catch {
      throw {
        message: "Invalid server response",
        status: res.status,
      } as ApiError;
    }
    if (!res.ok)
      throw {
        message: data?.error || data?.message || "Signup failed.",
        status: res.status,
      } as ApiError;

    return data;
  },

  // LOGOUT: Hits the Next.js Bridge
  logout: async () => {
    setAccessToken(null);
    try {
      await fetch(`/api/auth/logout`, { method: "POST" });
    } catch (e) {
      console.warn("Backend logout failed, but frontend is cleared.");
    }
    if (typeof window !== "undefined") window.location.href = "/?clear=1";
  },
};
