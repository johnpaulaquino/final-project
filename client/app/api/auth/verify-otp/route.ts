import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_VERIFICATION_KEY } from "@/lib/constants/auth";

export async function POST(request: Request) {
  const otpString = await request.json();
  const cookieStore = await cookies();
  const vToken = cookieStore.get(COOKIE_VERIFICATION_KEY)?.value;

  const res = await fetch(
    `${process.env.BACKEND_INTERNAL_URL}/auth/verify-otp`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: vToken ? `${COOKIE_VERIFICATION_KEY}=${vToken}` : "",
      },
      body: JSON.stringify(otpString),
    },
  );

  const data = await res.json();
  if (!res.ok) return NextResponse.json(data, { status: res.status });
  return NextResponse.json(data);
}
