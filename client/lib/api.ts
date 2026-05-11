export interface ApiError {
  message: string;
  status: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_INTERNAL_URL;

console.log("Base endpoint", API_BASE_URL);
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
  // Use the exact endpoint provided by the React components
  const url = `${API_BASE_URL}${endpoint}`;

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
    if (isRefreshing) {
      try {
        const newToken = await new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });

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
        const refreshRes = await fetchWithTimeout(
          `${API_BASE_URL}/auth/refresh-token`,
          {
            method: "POST",
            credentials: "include",
          },
        );

        if (!refreshRes.ok) throw new Error("Refresh failed");

        const refreshData = await refreshRes.json();

        setAccessToken(refreshData.access_token);

        if (typeof document !== "undefined") {
          document.cookie = `access_token=${refreshData.access_token}; path=/; max-age=86400;`;
        }

        processQueue(null, refreshData.access_token);

        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${refreshData.access_token}`,
        };
        res = await fetchWithTimeout(url, config);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);

        await fetchWithTimeout(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          credentials: "include",
        }).catch(() => {});

        if (typeof document !== "undefined") {
          document.cookie =
            "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          document.cookie =
            "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

          // 🚀 THE SIGNAL: Trigger the loop breaker in the middleware
          if (window.location.pathname !== "/") {
            window.location.href = "/?clear=1";
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

  // 3. Handle the final response
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

    if (data && data.access_token) {
      setAccessToken(data.access_token);
      if (typeof document !== "undefined") {
        document.cookie = `access_token=${data.access_token}; path=/; max-age=86400;`;
      }
    }

    return data;
  },

  logout: async () => {
    setAccessToken(null);

    if (typeof document !== "undefined") {
      document.cookie =
        "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie =
        "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }

    try {
      await fetchWithTimeout(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.warn("Backend logout failed, but frontend is cleared.");
    }

    if (typeof window !== "undefined") {
      window.location.href = "/?clear=1";
    }
  },
};
