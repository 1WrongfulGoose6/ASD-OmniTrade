import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/utils/auth";
import { clearCsrfCookie, validateRequestCsrf } from "@/utils/csrf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  const csrfFailure = validateRequestCsrf(request);
  if (csrfFailure) return csrfFailure;

  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  clearCsrfCookie(res);
  return res;
}
