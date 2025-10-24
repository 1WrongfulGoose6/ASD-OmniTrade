import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/utils/prisma";
import { applySessionCookie, createSessionToken } from "@/utils/auth";
import { issueNewCsrfToken, validateRequestCsrf } from "@/utils/csrf";
import { decryptField } from "@/utils/encryption";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const csrfFailure = validateRequestCsrf(req);
    if (csrfFailure) return csrfFailure;

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

    const payload = {
      id: user.id,
      email: user.email,
      name: decryptField(user.name),
      role: user.role,
    };
    const res = NextResponse.json({ ok: true, user: payload });
    const token = createSessionToken(payload);
    applySessionCookie(res, token);
    issueNewCsrfToken(res);
    return res;
  } catch (e) {
    return NextResponse.json({ error: e.message || "server error" }, { status: 500 });
  }
}
