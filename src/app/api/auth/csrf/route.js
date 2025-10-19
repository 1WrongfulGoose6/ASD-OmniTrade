// src/app/api/auth/csrf/route.js
import { NextResponse } from "next/server";
import {
  generateCsrfToken,
  setCsrfCookie,
  CSRF_COOKIE_NAME,
} from "@/utils/csrf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request) {
  const existing = request.cookies.get(CSRF_COOKIE_NAME)?.value || null;
  const token = existing || generateCsrfToken();

  const response = NextResponse.json(
    { csrfToken: token },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );

  setCsrfCookie(response, token);
  response.headers.set("X-CSRF-Token", token);

  return response;
}
