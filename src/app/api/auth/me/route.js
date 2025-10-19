import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/utils/prisma";
import {
  applySessionCookie,
  createSessionToken,
  getUserIdFromCookies,
  getUserSession,
} from "@/utils/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ user: null }, { status: 200 });

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, email: true, role: true, blacklisted: true },
  });

  if (!user || user.blacklisted) {
    return NextResponse.json({ error: "This account has been blacklisted" }, { status: 403 });
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

    const update = { name, email };

    if (newPassword) {
      const me = await prisma.user.findUnique({ where: { id: Number(uid) } });
      if (!me) return NextResponse.json({ error: "user not found" }, { status: 404 });
      const match = await bcrypt.compare(currentPassword || "", me.passwordHash);
      if (!match) {
        return NextResponse.json({ error: "wrong current password" }, { status: 401 });
      }
      update.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: update,
      select: { id: true, name: true, email: true, role: true },
    });

    const res = NextResponse.json({ user: updated });
    const token = createSessionToken(updated);
    applySessionCookie(res, token);
    return res;
  } catch {
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

