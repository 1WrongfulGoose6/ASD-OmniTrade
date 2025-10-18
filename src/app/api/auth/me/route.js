// src/app/api/auth/me/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getAuthPayload, requireUserId, verifyCsrf } from "@/utils/auth";
import { encrypt, decrypt } from "@/utils/encryption";
import logger from "@/utils/logger";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payload = await getAuthPayload();
    if (!payload?.id) return NextResponse.json({ user: null }, { status: 200 });

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, name: true, email: true, blacklisted: true },
    });

    if (!user || user.blacklisted) {
      // Also clear the cookie if the user is blacklisted or not found
      const res = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      res.cookies.delete("accessToken");
      res.cookies.delete("csrf-token");
      return res;
    }

    const responseUser = { ...user, name: user.name ? decrypt(user.name) : null };
    return NextResponse.json({ user: responseUser });
  } catch (e) {
    logger.error({ err: e }, "[me GET] error");
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

// PUT update current user profile (name + email)
export async function PUT(req) {
  try {
    await verifyCsrf(req.headers);
    const userId = await requireUserId();

    const body = await req.json();
    const { name, email, currentPassword, newPassword } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "name and email required" }, { status: 400 });
    }

    // check if email belongs to someone else
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== userId) {
      return NextResponse.json({ error: "email already in use" }, { status: 409 });
    }

    let update = { name: encrypt(name), email };

    if (newPassword) {
      const me = await prisma.user.findUnique({ where: { id: userId } });
      const match = await bcrypt.compare(currentPassword || "", me.passwordHash);
      if (!match) {
        return NextResponse.json({ error: "wrong current password" }, { status: 401 });
      }
      update.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: update,
      select: { id: true, name: true, email: true },
    });

    const responseUser = { ...updated, name: updated.name ? decrypt(updated.name) : null };
    return NextResponse.json({ user: responseUser });
  } catch (e) {
    logger.error({ err: e }, "[me PUT] error");
    if (e.message.includes("csrf") || e.message.includes("unauthorized")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
