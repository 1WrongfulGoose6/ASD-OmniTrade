// src/app/api/auth/logout/route.js
import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/utils/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
}
