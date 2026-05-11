import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteAuthCookies } from "@/lib/authUtils";

export async function PATCH(request: Request) {
  try {
    const newPassword = await request.json(); // Gets new password from React
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    const refreshToken = cookieStore.get("refresh_token")?.value;
    const vToken = cookieStore.get("verification_token")?.value;

    const cookieParts = [];
    if (accessToken) cookieParts.push(`access_token=${accessToken}`);
    if (refreshToken) cookieParts.push(`refresh_token=${refreshToken}`);
    if (vToken) cookieParts.push(`verification_token=${vToken}`);

    const res = await fetch(
      `${process.env.BACKEND_INTERNAL_URL}/me/forgot-password`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          Cookie: cookieParts.join("; "),
        },
        // Ensure we send exactly what FastAPI Body(...) expects
        body: JSON.stringify(newPassword),
      },
    );

    const data = await res.json();
    if (!res.ok) return NextResponse.json(data, { status: res.status });

    // Success! The password is changed, so wipe the temporary verification cookie
    await deleteAuthCookies();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Forgot Password Bridge Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
