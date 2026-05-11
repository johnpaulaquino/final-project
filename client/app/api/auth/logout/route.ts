import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteAuthCookies } from "@/lib/authUtils"; // Adjust path to your utility file if needed

export async function POST() {
  try {
    const cookieStore = await cookies();
    // Grab the refresh token before we delete it, so we can tell FastAPI to invalidate it
    const refreshToken = cookieStore.get("refresh_token")?.value;

    const backendUrl = process.env.BACKEND_INTERNAL_URL;

    // 1. Tell FastAPI to invalidate the token in Redis
    // We wrap this in a try/catch so that if the backend is down,
    // the user still gets safely logged out on the frontend.
    if (refreshToken && backendUrl) {
      await fetch(`${backendUrl}/auth/logout`, {
        method: "POST",
        headers: {
          // Forward the cookie manually so FastAPI can read it!
          Cookie: `refresh_token=${refreshToken}`,
        },
      }).catch((err) =>
        console.warn("Backend logout failed, continuing frontend logout:", err),
      );
    }

    // 2. Wipe the cookies from the user's browser!
    await deleteAuthCookies();

    // 3. Send success response to React
    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout Bridge Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
