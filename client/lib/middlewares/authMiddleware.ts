import { NextRequest, NextResponse } from "next/server";

interface AuthMiddlewareOptions {
  publicRoutes?: string[];
  adminRoute?: string;
  customerRoute?: string;
  loginRoute?: string;
  defaultAuthenticatedRedirect?: string;
}

const DEFAULT_OPTIONS: Required<AuthMiddlewareOptions> = {
  publicRoutes: ["/"],
  adminRoute: "/admin",
  customerRoute: "/customer",
  loginRoute: "/",
  defaultAuthenticatedRedirect: "/customer",
};

export function withAuth(
  request: NextRequest,
  options?: AuthMiddlewareOptions,
) {
  const config = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const { pathname, searchParams } = request.nextUrl;

  // 🚀 THE LOOP BREAKER: If the URL has ?clear=1, destroy cookies server-side!
  if (searchParams.get("clear") === "1") {
    const response = NextResponse.redirect(
      new URL(config.loginRoute, request.url),
    );
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    return response;
  }

  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;
  const hasAuth = !!accessToken || !!refreshToken;

  const isAdminRoute = pathname.startsWith(config.adminRoute);
  const isCustomerRoute = pathname.startsWith(config.customerRoute);
  const isProtectedRoute = isAdminRoute || isCustomerRoute;
  const isPublicRoute = config.publicRoutes.includes(pathname);

  // Block unauthenticated users
  if (isProtectedRoute && !hasAuth) {
    return NextResponse.redirect(new URL(config.loginRoute, request.url));
  }

  // Prevent authenticated users from revisiting login
  if (isPublicRoute && hasAuth) {
    return NextResponse.redirect(
      new URL(config.defaultAuthenticatedRedirect, request.url),
    );
  }

  return NextResponse.next();
}
