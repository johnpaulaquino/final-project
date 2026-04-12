// src/lib/apiClient.ts

export interface ApiError {
  message: string;
  status: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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

// Helper to process the queue of waiting requests
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
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
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw { message: "Request timed out.", status: 408 } as ApiError;
    }
    throw { message: "Cannot connect to server.", status: 0 } as ApiError;
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

  // 1. CRITICAL FIX: Check if the body we are sending is FormData
  const isFormData = options.body instanceof FormData;

  const config: RequestInit = {
    ...options,
    credentials: "include", // Always include cookies (like HttpOnly refresh token)
    headers: {
      // ONLY apply application/json if we are NOT sending files
      ...(!isFormData && { "Content-Type": "application/json" }),
      ...options.headers,
    },
  };

  // If it's a private route and we have a token in memory, attach it
  if (isPrivate && currentAccessToken) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${currentAccessToken}`,
    };
  }

  // 1. Make the initial request
  let res = await fetchWithTimeout(url, config);

  // 2. Intercept 401 Unauthorized
  if (
    isPrivate &&
    res.status === 401 &&
    endpoint !== "/auth/login" &&
    endpoint !== "/auth/refresh-token"
  ) {
    // If another request is already refreshing the token, join the queue
    if (isRefreshing) {
      try {
        const newToken = await new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });

        // Once the queue resolves, retry the original request with the new token
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${newToken}`,
        };
        res = await fetchWithTimeout(url, config);
      } catch (err) {
        throw err;
      }
    } else {
      // We are the first request to hit a 401! Lock the refresh state.
      isRefreshing = true;

      try {
        const refreshRes = await fetchWithTimeout(
          `${API_BASE_URL}/auth/refresh-token`,
          {
            method: "POST",
            credentials: "include",
          },
        );

        if (!refreshRes.ok) throw new Error("Refresh failed");

        const refreshData = await refreshRes.json();

        // Assuming your FastAPI returns { access_token: "..." }
        setAccessToken(refreshData.access_token);

        // Process all queued requests with the new token
        processQueue(null, refreshData.access_token);

        // Retry the original request
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${refreshData.access_token}`,
        };
        res = await fetchWithTimeout(url, config);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);

        // Optional: Redirect to login or clear auth state
        if (typeof window !== "undefined" && window.location.pathname !== "/") {
          window.location.href = "/";
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

  // 3. Handle the final response (successful or failed for other reasons)
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
      message: data?.detail || data?.message || "An error occurred.",
      status: res.status,
    } as ApiError;
  }

  return data;
}

export const apiClient = {
  get: (endpoint: string) => apiFetch(endpoint, { method: "GET" }, true),

  // Applied the fix to POST and PUT as well, to future-proof your app!
  post: (endpoint: string, body: any) => {
    const isFormData = body instanceof FormData;
    return apiFetch(
      endpoint,
      { method: "POST", body: isFormData ? body : JSON.stringify(body) },
      true,
    );
  },

  put: (endpoint: string, body: any) => {
    const isFormData = body instanceof FormData;
    return apiFetch(
      endpoint,
      { method: "PUT", body: isFormData ? body : JSON.stringify(body) },
      true,
    );
  },

  patch: (endpoint: string, body: any) => {
    // 2. CRITICAL FIX: Don't stringify FormData!
    const isFormData = body instanceof FormData;

    return apiFetch(
      endpoint,
      { method: "PATCH", body: isFormData ? body : JSON.stringify(body) },
      true,
    );
  },

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
    const res = await fetchWithTimeout(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body,
      credentials: "include", // Required so the browser saves the set-cookie header!
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
