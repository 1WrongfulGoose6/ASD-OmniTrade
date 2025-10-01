// src/app/api/auth/me/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getUserIdFromCookies } from "@/utils/auth";

import bcrypt from "bcryptjs"; // for password check


export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getUserIdFromCookies();
  if (!userId) return NextResponse.json({ user: null }, { status: 200 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true }
  });

  if (!user || user.blacklisted) {
    return NextResponse.json({ error: "This account has been blacklisted" }, { status: 403 }); // blacklisted check
  }

  return NextResponse.json({ user });
}



// PUT update current user profile (name + email)
export async function PUT(req) {
  try {
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

    let update = { name, email };

    if (newPassword) {
      const me = await prisma.user.findUnique({ where: { id: Number(uid) } });
      const match = await bcrypt.compare(currentPassword || "", me.passwordHash);
      if (!match) {
        return NextResponse.json({ error: "wrong current password" }, { status: 401 });
      }
      update.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const updated = await prisma.user.update({
      where: { id: Number(uid) },
      data: update,
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ user: updated });
  } catch {
  return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}