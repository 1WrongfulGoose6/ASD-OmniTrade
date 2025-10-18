// src/app/api/auth/logout/route.js
import { NextResponse } from "next/server";
import { verifyCsrf } from "@/utils/auth";
import logger from "@/utils/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    await verifyCsrf(req.headers);

    const res = NextResponse.json({ ok: true });
    res.cookies.set("accessToken", "", { httpOnly: true, path: "/", maxAge: 0 });
    res.cookies.set("csrf-token", "", { path: "/", maxAge: 0 });

    return res;
  } catch (e) {
    logger.error({ err: e }, "[logout] error");
    if (e.message.includes("csrf")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}