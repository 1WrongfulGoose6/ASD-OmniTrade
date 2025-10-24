import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/utils/prisma";
import { applySessionCookie, createSessionToken } from "@/utils/auth";
import { issueNewCsrfToken, validateRequestCsrf } from "@/utils/csrf";
import { decryptField, encryptField } from "@/utils/encryption";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const csrfFailure = validateRequestCsrf(req);
    if (csrfFailure) return csrfFailure;

    const { name, email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "email and password required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    const encryptedName = name ? encryptField(name) : null;
    const user = await prisma.user.create({
      data: { name: encryptedName, email, passwordHash, role: "USER" },
      select: { id: true, name: true, email: true, createdAt: true, role: true },
    });

    // Optionally auto-log in right after register:
    const sanitizedUser = { ...user, name: decryptField(user.name) };

    const res = NextResponse.json({ user: sanitizedUser }, { status: 201 });
    const token = createSessionToken({ id: sanitizedUser.id, email: sanitizedUser.email, role: sanitizedUser.role });
    applySessionCookie(res, token);
    issueNewCsrfToken(res);
    return res;
  } catch (e) {
    return NextResponse.json({ error: e.message || "server error" }, { status: 500 });
  }
}
