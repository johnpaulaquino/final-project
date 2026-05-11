import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { setAuthCookies } from "@/lib/authUtils"; // Adjust import path if necessary

export async function POST(request: Request) {
  try {
    // 1. Get the payload from the React frontend (firstname, lastname, password, etc.)
    const payload = await request.json();

    // 2. Grab the temporary verification cookie from the browser
    const cookieStore = await cookies();
    const vToken = cookieStore.get("verification_token")?.value;

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_INTERNAL_URL;
    if (!backendUrl) {
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 },
      );
    }

    const res = await fetch(`${backendUrl}/auth/complete-signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Pass the cookie manually so FastAPI's `verification_token: str = Cookie(None)` can read it
        Cookie: vToken ? `verification_token=${vToken}` : "",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    // 4. If FastAPI throws an error (e.g., passwords don't match, or token expired)
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    // 5. 🚀 SUCCESS: Elevate the user to a fully logged-in session!
    // We pass the new tokens to your utility, and null for the verification token
    await setAuthCookies(
      data.access_token || null,
      data.refresh_token || null,
      data.csrf_token || null,
      null,
    );

    // 6. Wipe the temporary verification token from the browser
    cookieStore.delete("verification_token");

    // 7. Send the success response back to React
    return NextResponse.json(data);
  } catch (error) {
    console.error("Complete Signup Bridge Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
