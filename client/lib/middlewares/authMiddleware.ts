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
      const response = NextResponse.redirect(new URL("/", request.url));
      return response;
    }
    return undefined;
  }

  // If access_token is expired, but refresh_token is alive -> Let them pass!
  // Your apiClient.ts will handle the 401 and refresh the token automatically.
  if (!token && refreshToken) {
    return undefined;
  }

  let userRole = null;
  if (token) {
    const decodedPayload = decodeJwt(token);
    userRole = decodedPayload?.role;
  }

  if (isAdminRoute && userRole !== "Admin") {
    return NextResponse.redirect(new URL("/customer", request.url));
  }

  if (isCustomerRoute && userRole !== "Customer") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Auto-Redirect from the login page based on role!
  if (pathname === "/") {
    if (userRole === "Admin")
      return NextResponse.redirect(new URL("/admin", request.url));
    if (userRole === "Customer")
      return NextResponse.redirect(new URL("/customer", request.url));
  }

  return undefined;
}
