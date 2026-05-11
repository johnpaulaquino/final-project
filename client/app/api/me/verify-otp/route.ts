import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { setAuthCookies } from "@/lib/authUtils";

export async function POST(request: Request) {
  try {
    const otpString = await request.json(); // Gets the body from React
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    const refreshToken = cookieStore.get("refresh_token")?.value;
    const vToken = cookieStore.get("verification_token")?.value;

    const cookieParts = [];
    if (accessToken) cookieParts.push(`access_token=${accessToken}`);
    if (refreshToken) cookieParts.push(`refresh_token=${refreshToken}`);
    if (vToken) cookieParts.push(`verification_token=${vToken}`);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_INTERNAL_URL}/me/verify-otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          Cookie: cookieParts.join("; "),
        },
        body: JSON.stringify(otpString),
      },
    );

    const data = await res.json();
    if (!res.ok) return NextResponse.json(data, { status: res.status });

    if (data.verification_token) {
      await setAuthCookies(data.verification_token);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Verify OTP Bridge Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
