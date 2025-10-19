import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/utils/prisma";
import {
  applySessionCookie,
  createSessionToken,
  getUserIdFromCookies,
  getUserSession,
} from "@/utils/auth";
import {
  issueNewCsrfToken,
  validateRequestCsrf,
} from "@/utils/csrf";
import { decryptField, encryptField } from "@/utils/encryption";

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

  return NextResponse.json({
    user: {
      ...user,
      name: decryptField(user.name),
    },
  });
}

// PUT update current user profile (name + email)
export async function PUT(req) {
  try {
    const csrfFailure = validateRequestCsrf(req);
    if (csrfFailure) return csrfFailure;

    const uid = await getUserIdFromCookies();
    if (!uid) return NextResponse.json({ error: "not logged in" }, { status: 401 });

    const body = await req.json();
    const { name, email, currentPassword, newPassword } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "name and email required" }, { status: 400 });
    }

    // check if email belongs to someone else
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== Number(uid)) {
      return NextResponse.json({ error: "email already in use" }, { status: 409 });
    }

    const update = { name: encryptField(name), email };

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
      where: { id: Number(uid) },
      data: update,
      select: { id: true, name: true, email: true, role: true },
    });

    const responseBody = {
      user: {
        ...updated,
        name: decryptField(updated.name),
      },
    };

    const res = NextResponse.json(responseBody);
    const token = createSessionToken(updated);
    applySessionCookie(res, token);
    issueNewCsrfToken(res);
    return res;
  } catch {
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
