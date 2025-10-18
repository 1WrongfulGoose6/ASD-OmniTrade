// src/app/api/auth/register/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "@/utils/prisma";
import { encrypt, decrypt } from "@/utils/encryption";
import logger from "@/utils/logger";

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
      data: { name: name ? encrypt(name) : null, email, passwordHash },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    // Decrypt name for the response
    const responseUser = { ...user, name: user.name ? decrypt(user.name) : null };

    // Auto-log in right after register by creating JWT and CSRF token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logger.error("JWT_SECRET is not set");
      return NextResponse.json({ error: "configuration_error" }, { status: 500 });
    }

    const csrfToken = crypto.randomBytes(32).toString("hex");
    const token = jwt.sign(
      { id: user.id, email: user.email, name: responseUser.name, csrfToken },
      secret,
      { expiresIn: "1d" }
    );

    const res = NextResponse.json({ user: responseUser }, { status: 201 });
    res.cookies.set("accessToken", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    res.cookies.set("csrf-token", csrfToken, {
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return res;
  } catch (e) {
    logger.error({ err: e }, "[register] error");
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
