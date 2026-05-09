// lib/utils/auth-cookies.ts
import { cookies } from "next/headers";
import {
  COOKIE_ACCESS_TOKEN,
  COOKIE_CSRF_TOKEN,
  COOKIE_REFRESH_TOKEN,
  COOKIE_VERIFICATION_KEY,
} from "./constants/auth";

interface AuthTokens {
  access_token?: string;
  refresh_token?: string;
  csrf_token?: string;
  verification_token?: string;
}

const IS_PRODUCTION = process.env.NODE_ENV === "production";

/**
 * Sets authentication cookies securely on the Vercel domain.
 */
export async function setAuthCookies(tokens: AuthTokens) {
  const cookieStore = await cookies();

  if (tokens.access_token) {
    cookieStore.set({
      name: COOKIE_ACCESS_TOKEN,
      value: tokens.access_token,
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60, // 15 minutes
    });
  }

  if (tokens.refresh_token) {
    cookieStore.set({
      name: COOKIE_REFRESH_TOKEN,
      value: tokens.refresh_token,
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });
  }

  if (tokens.csrf_token) {
    cookieStore.set({
      name: COOKIE_CSRF_TOKEN,
      value: tokens.csrf_token,
      httpOnly: true, // Match backend (false so client can read if needed)
      secure: IS_PRODUCTION,
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60, // 15 minutes
    });
  }

  if (tokens.verification_token) {
    cookieStore.set({
      name: COOKIE_VERIFICATION_KEY,
      value: tokens.verification_token,
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60, // 15 minutes
    });
  }
}

/**
 * Deletes all authentication cookies (Useful for a Next.js logout proxy).
 */
export async function deleteAuthCookies() {
  const cookieStore = await cookies();

  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
  cookieStore.delete("csrf_token");
  cookieStore.delete("verification_token");
}
