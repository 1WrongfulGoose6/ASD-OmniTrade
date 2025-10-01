// src/app/api/auth/register/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/utils/prisma";

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

    const res = NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } });
    res.cookies.set("uid", String(user.id), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (e) {
    return NextResponse.json({ error: e.message || "server error" }, { status: 500 });
  }
}
