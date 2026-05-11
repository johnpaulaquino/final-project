import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { setAuthCookies, deleteAuthCookies } from "@/lib/authUtils"; // Adjust path if needed

export async function POST() {
  try {
    const cookieStore = await cookies();
    // 1. Grab the refresh token from the browser's HttpOnly cookies
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "No refresh token found" },
        { status: 401 },
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_INTERNAL_URL;
    if (!backendUrl) {
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 },
      );
    }

    // 2. Secretly forward the refresh request to FastAPI
    const res = await fetch(`${backendUrl}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // FastAPI is expecting this in the Cookie header!
        Cookie: `refresh_token=${refreshToken}`,
      },
    });

    const data = await res.json();

    // 3. If FastAPI rejects the token (e.g., it expired or was revoked)
    if (!res.ok) {
      // Wipe the dead cookies from the user's browser so they are fully logged out
      await deleteAuthCookies();
      return NextResponse.json(data, { status: res.status });
    }

    // 4. Success! Set the brand new tokens into secure cookies
    await setAuthCookies(
      data.access_token,
      data.refresh_token,
      data.csrf_token,
      null,
    );

    // 5. Send the new access token back to the React client
    return NextResponse.json(data);
  } catch (error) {
    console.error("Refresh Bridge Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
