import crypto from "crypto";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/utils/prisma";
import { decrypt } from "@/utils/encryption";
import logger from "@/utils/logger";

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

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logger.error("JWT_SECRET is not set");
      return NextResponse.json({ error: "configuration_error" }, { status: 500 });
    }

    // Decrypt the user's name for use in the token and response
    const responseUser = { ...user, name: user.name ? decrypt(user.name) : null };

    const csrfToken = crypto.randomBytes(32).toString("hex");

    const token = jwt.sign(
      { id: responseUser.id, email: responseUser.email, name: responseUser.name, csrfToken },
      secret,
      { expiresIn: "1d" }
    );

    const res = NextResponse.json({ ok: true, user: { id: responseUser.id, email: responseUser.email, name: responseUser.name } });
    res.cookies.set("accessToken", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    // Set the CSRF token in a separate, non-HttpOnly cookie for the client to read
    res.cookies.set("csrf-token", csrfToken, {
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    return res;
  } catch (e) {
    logger.error({ err: e }, "[login] error");
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
