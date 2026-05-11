
import { NextRequest, NextResponse } from "next/server";

interface AuthMiddlewareOptions {
  publicRoutes?: string[];
  adminRoute?: string;
  customerRoute?: string;
  loginRoute?: string;
}

const DEFAULT_OPTIONS: Required<AuthMiddlewareOptions> = {
  publicRoutes: ["/"],
  adminRoute: "/admin",
  customerRoute: "/customer",
  loginRoute: "/",
};

interface JwtPayload {
  role?: string;
  exp?: number;
}

// src/lib/middlewares/authMiddleware.ts

// ... (keep your interface and DEFAULT_OPTIONS up top)

function decodeJwt(token?: string): any | null {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function isExpired(exp?: number): boolean {
  if (!exp) return true;
  return Date.now() >= exp * 1000;
}

// 🚀 FIX 1: Create a simple checker just to see if a token is mathematically alive
function isTokenAlive(token?: string): boolean {
  const payload = decodeJwt(token);
  if (!payload) return false;
  return !isExpired(payload.exp);
}

export function withAuth(
  request: NextRequest,
  options?: AuthMiddlewareOptions,
) {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  // 1. Check if tokens are actually alive
  const isAccessAlive = isTokenAlive(accessToken);
  const isRefreshAlive = isTokenAlive(refreshToken);

  const isAdminRoute = pathname.startsWith(config.adminRoute);
  const isCustomerRoute = pathname.startsWith(config.customerRoute);
  const isProtectedRoute = isAdminRoute || isCustomerRoute;
  const isPublicRoute = config.publicRoutes.includes(pathname);

  // 🚀 FIX 2: Only kick them out if BOTH tokens are dead or missing
  if (isProtectedRoute && !isAccessAlive && !isRefreshAlive) {
    const response = NextResponse.redirect(new URL(config.loginRoute, request.url));
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    return response;
  }

  // 3. Role Checking (Only strict if the access token is alive)
  let role = null;
  if (isAccessAlive) {
    role = decodeJwt(accessToken)?.role?.toLowerCase();
  }
  // 🚀 FIX 3: If access is dead but refresh is alive, we temporarily ASSUME
  // their role based on the URL they are trying to visit. This lets the page load
  // so apiClient.ts can trigger the background refresh!
  else if (isRefreshAlive) {
    role = decodeJwt(refreshToken)?.role?.toLowerCase();
    if (!role) {
      role = isAdminRoute ? "admin" : "customer";
    }
  }

  // Admin-only protection
  if (isAdminRoute && role !== "admin") {
    return NextResponse.redirect(new URL(config.customerRoute, request.url));
  }

  // Customer-only protection
  if (isCustomerRoute && role !== "customer") {
    return NextResponse.redirect(new URL(config.adminRoute, request.url));
  }

  // Prevent authenticated users from revisiting login
  if (isPublicRoute && (isAccessAlive || isRefreshAlive)) {
    // If they have an alive token, push them to their dashboard
    if (role === "admin") {
      return NextResponse.redirect(new URL(config.adminRoute, request.url));
    }
    return NextResponse.redirect(new URL(config.customerRoute, request.url));
  }

  return NextResponse.next();
}