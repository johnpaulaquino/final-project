import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Helper to safely decode the JWT payload on the Server Edge
function decodeJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export function withAuth(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isCustomerRoute = pathname.startsWith("/customer");

  const token = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  // If NO tokens exist at all -> Kick to login
  if (!token && !refreshToken) {
    if (isAdminRoute || isCustomerRoute) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return undefined;
  }

  // Get the userRole from whichever token is available
  let userRole = null;
  if (token) {
    userRole = decodeJwt(token)?.role;
  } else if (refreshToken) {
    userRole = decodeJwt(refreshToken)?.role;
  }

  // 🚀 FIX 1: Normalize the role to lowercase to avoid case-sensitivity bugs
  // (e.g. "admin" vs "Admin")
  const safeRole = userRole?.toLowerCase();

  // 🚀 FIX 2: Stop the Infinite Ping-Pong Loop
  // If they are on an Admin route but NOT an admin...
  if (isAdminRoute && safeRole !== "admin") {
    // If we know they are a customer, send to customer
    if (safeRole === "customer") {
      return NextResponse.redirect(new URL("/customer", request.url));
    }
    // If the role is missing, undefined, or malformed, kick them to login
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If they are on a Customer route but NOT a customer...
  if (isCustomerRoute && safeRole !== "customer") {
    // If we know they are an admin, send to admin
    if (safeRole === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    // If the role is missing, undefined, or malformed, kick them to login
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Auto-Redirect from the login page based on role!
  if (pathname === "/") {
    if (safeRole === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (safeRole === "customer") {
      return NextResponse.redirect(new URL("/customer", request.url));
    }
  }

  return undefined;
}
