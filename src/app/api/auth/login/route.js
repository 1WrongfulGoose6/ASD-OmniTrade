// src/app/api/auth/login/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/utils/prisma";
import {
  applySessionCookie,
  createSessionToken,
} from "@/utils/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "email and password required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "invalid credentials" }, { status: 401 });

    if (user.blacklisted) {
      return NextResponse.json({ error: "This account has been blacklisted" }, { status: 403 }); // blacklist check
    }

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) return NextResponse.json({ error: "invalid credentials" }, { status: 401 });

    const payload = { id: user.id, email: user.email, name: user.name, role: user.role };
    const res = NextResponse.json({ ok: true, user: payload });
    const token = createSessionToken(payload);
    applySessionCookie(res, token);
    return res;
  } catch (e) {
    logger.error({ err: e }, "[login] error");
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
