import { NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/authUtils"; // Adjust path if needed

export async function POST(request: Request) {
  const body = await request.json();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_INTERNAL_URL;

  const res = await fetch(`${backendUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      username: body.email,
      password: body.password,
    }),
  });

  const data = await res.json();
  if (!res.ok) return NextResponse.json(data, { status: res.status });

  // Set the fully authenticated cookies!
  await setAuthCookies(
    data.access_token,
    data.refresh_token,
    data.csrf_token,
    null,
  );

  return NextResponse.json(data);
}
