// src/lib/apiClient.ts

export interface ApiError {
  message: string;
  status: number;
}

const API_BASE_URL =
  process.env.BACKEND_INTERNAL_URL || "http://localhost:9898/api/v1/biskota";

let currentAccessToken: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

// Helper to read cookies safely on the client side
const getCookie = (name: string) => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
};

// Hydrate the token from the cookie if memory is empty
export const getAccessToken = () => {
  if (!currentAccessToken) {
    currentAccessToken = getCookie("access_token");
    console.log("TOken", currentAccessToken);
  }
  return currentAccessToken;
};

export const setAccessToken = (token: string | null) => {
  currentAccessToken = token;
};

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
  // 🚀 SILVER BULLET: Automatically fix missing trailing slashes!
  let safeEndpoint = endpoint;

  // If there are query parameters (like /cart?skip=1)
  if (safeEndpoint.includes("?")) {
    safeEndpoint = safeEndpoint.replace(/([^/])\?/, "$1/?");
  }
  // If there are no query parameters (like /me), just add the slash to the end
  else if (!safeEndpoint.endsWith("/")) {
    safeEndpoint += "/";
  }

  // Use the safely formatted endpoint
  const url = `${API_BASE_URL}${safeEndpoint}`;

  // Check if the body we are sending is FormData
  const isFormData = options.body instanceof FormData;

  const config: RequestInit = {
    ...options,
    credentials: "include",
    headers: {
      ...(!isFormData && { "Content-Type": "application/json" }),
      ...options.headers,
    },
  };

  // If it's a private route, attach the token from memory or cookies
  const tokenToUse = isPrivate ? getAccessToken() : null;
  if (tokenToUse) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${tokenToUse}`,
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

        // Save new token in memory
        setAccessToken(refreshData.access_token);

        // Update the cookie so it survives the next page refresh
        if (typeof document !== "undefined") {
          document.cookie = `access_token=${refreshData.access_token}; path=/; max-age=86400;`;
        }

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

        // Force backend to clear the HttpOnly cookies if it exists
        await fetchWithTimeout(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          credentials: "include",
        }).catch(() => {}); // Ignore errors here, we just want to attempt to clear

        // DESTROY FRONTEND COOKIES SO THE MIDDLEWARE DOESN'T TRAP YOU
        if (typeof document !== "undefined") {
          document.cookie =
            "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          document.cookie =
            "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

          if (window.location.pathname !== "/") {
            window.location.href = "/";
          }
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

    const res = await fetchWithTimeout(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body,
      credentials: "include",
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

    // Save the new token directly into memory and cookies!
    if (data && data.access_token) {
      setAccessToken(data.access_token);
      if (typeof document !== "undefined") {
        document.cookie = `access_token=${data.access_token}; path=/; max-age=86400;`;
      }
    }

    return data;
  },

  logout: async () => {
    // Clear frontend memory
    setAccessToken(null);

    // Destroy frontend cookies
    if (typeof document !== "undefined") {
      document.cookie =
        "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie =
        "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }

    try {
      // Call the logout endpoint to clear the HttpOnly refresh token cookie
      await fetchWithTimeout(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.warn("Backend logout failed, but frontend is cleared.");
    }

    // Redirect back to the login page (or homepage)
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  },
};
