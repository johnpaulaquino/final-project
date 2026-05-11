import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { setAuthCookies } from "@/lib/authUtils";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    const refreshToken = cookieStore.get("refresh_token")?.value;
    const vToken = cookieStore.get("verification_token")?.value;

    // Construct the Cookie header so FastAPI can read them
    const cookieParts = [];
    if (accessToken) cookieParts.push(`access_token=${accessToken}`);
    if (refreshToken) cookieParts.push(`refresh_token=${refreshToken}`);
    if (vToken) cookieParts.push(`verification_token=${vToken}`);

    const backendUrl = process.env.BACKEND_INTERNAL_URL;

    // Call your FastAPI /me (or /users) router
    const res = await fetch(`${backendUrl}/me/initiate-password-reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Forward Bearer token in case get_current_user expects it in the header
        Authorization: `Bearer ${accessToken}`,
        Cookie: cookieParts.join("; "),
      },
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json(data, { status: res.status });

    // Save the new verification token from FastAPI to a secure cookie
    if (data.verification_token) {
      await setAuthCookies(null, null, null, data.verification_token);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Initiate Reset Bridge Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
