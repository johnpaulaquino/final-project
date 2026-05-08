import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withAuth } from "@/lib/middlewares/authMiddleware";

// import { withLogger } from '@/lib/middlewares/loggerMiddleware';

export default function proxy(request: NextRequest) {
  // const authResponse = withAuth(request);
  // if (authResponse) return authResponse;

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
