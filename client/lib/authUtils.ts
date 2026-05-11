// lib/utils/auth-cookies.ts
import { cookies } from "next/headers";
import {
  COOKIE_ACCESS_TOKEN,
  COOKIE_CSRF_TOKEN,
  COOKIE_REFRESH_TOKEN,
  COOKIE_VERIFICATION_KEY,
} from "./constants/auth";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

export async function setAuthCookies(
  access_token: string | null = null,
  refresh_token: string | null = null,
  csrf_token: string | null = null,
  verification_token: string | null = null,
) {
  const cookieStore = await cookies();

  if (access_token) {
    cookieStore.set({
      name: COOKIE_ACCESS_TOKEN,
      value: access_token,
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60,
    });
  }

  if (refresh_token) {
    cookieStore.set({
      name: COOKIE_REFRESH_TOKEN,
      value: refresh_token,
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });
  }

  if (csrf_token) {
    cookieStore.set({
      name: COOKIE_CSRF_TOKEN,
      value: csrf_token,
      httpOnly: false,
      secure: IS_PRODUCTION,
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60,
    });
  }

  if (verification_token) {
    cookieStore.set({
      name: COOKIE_VERIFICATION_KEY,
      value: verification_token,
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60,
    });
  }
}

/**
 * Deletes all authentication cookies (Useful for a Next.js logout proxy).
 */
export async function deleteAuthCookies() {
  const cookieStore = await cookies();

  cookieStore.delete(COOKIE_ACCESS_TOKEN);
  cookieStore.delete(COOKIE_REFRESH_TOKEN);
  cookieStore.delete(COOKIE_CSRF_TOKEN);
  cookieStore.delete(COOKIE_VERIFICATION_KEY);
}
