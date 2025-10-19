// src/app/api/auth/register/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "@/utils/prisma";
import {
  applySessionCookie,
  createSessionToken,
} from "@/utils/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "email and password required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    const user = await prisma.user.create({
      data: { name: name || null, email, passwordHash, role: "USER" },
      select: { id: true, name: true, email: true, createdAt: true, role: true },
    });

    // Optionally auto-log in right after register:
    const res = NextResponse.json({ user }, { status: 201 });
    const token = createSessionToken({ id: user.id, email: user.email, role: user.role });
    applySessionCookie(res, token);
    return res;
  } catch (e) {
    logger.error({ err: e }, "[register] error");
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
