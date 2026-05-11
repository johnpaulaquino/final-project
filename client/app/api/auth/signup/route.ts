import { setAuthCookies } from "@/lib/authUtils";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const email = await request.json();
  const res = await fetch(
    `${process.env.BACKEND_INTERNAL_URL}/auth/signup`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(email),
    },
  );

  const data = await res.json();
  if (!res.ok) return NextResponse.json(data, { status: res.status });

  if (data.verification_token)
    await setAuthCookies(null, null, data.csrf_token, data.verification_token);
  return NextResponse.json(data);
}
