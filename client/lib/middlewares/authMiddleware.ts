
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

function decodeJwt(token?: string): JwtPayload | null {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];

    if (!payload) return null;

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");

    const decoded = atob(base64);

    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function isExpired(exp?: number): boolean {
  if (!exp) return true;

  return Date.now() >= exp * 1000;
}

function getUserRole(
  accessToken?: string,
  refreshToken?: string,
): string | null {
  // Prefer access token
  let payload = decodeJwt(accessToken);

  // Fallback to refresh token
  if (!payload) {
    payload = decodeJwt(refreshToken);
  }

  if (!payload) return null;

  // Ignore expired tokens
  if (isExpired(payload.exp)) {
    return null;
  }

  if (!payload.role) {
    return null;
  }

  return payload.role.toLowerCase();
}

export function withAuth(
  request: NextRequest,
  options?: AuthMiddlewareOptions,
) {
  const config = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("access_token")?.value;

  const refreshToken = request.cookies.get("refresh_token")?.value;

  const hasAuth = !!accessToken || !!refreshToken;

  const role = getUserRole(accessToken, refreshToken);

  const isAdminRoute = pathname.startsWith(config.adminRoute);

  const isCustomerRoute = pathname.startsWith(config.customerRoute);

  const isProtectedRoute = isAdminRoute || isCustomerRoute;

  const isPublicRoute = config.publicRoutes.includes(pathname);

  // Unauthenticated access
  if (isProtectedRoute && !hasAuth) {
    return NextResponse.redirect(new URL(config.loginRoute, request.url));
  }

  // Invalid or expired token
  if (isProtectedRoute && !role) {
    const response = NextResponse.redirect(
      new URL(config.loginRoute, request.url),
    );

    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");

    return response;
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
  if (isPublicRoute && role) {
    if (role === "admin") {
      return NextResponse.redirect(new URL(config.adminRoute, request.url));
    }

    if (role === "customer") {
      return NextResponse.redirect(new URL(config.customerRoute, request.url));
    }
  }

  return NextResponse.next();
}
