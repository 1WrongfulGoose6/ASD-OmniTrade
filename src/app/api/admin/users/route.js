// src/app/api/admin/users/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';
import { getUserSession } from '@/utils/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const session = await getUserSession();
  if (!session) return { error: 'not authenticated', code: 401 };
  if (session.role !== 'ADMIN') return { error: 'forbidden', code: 403 };
  return { ok: true, id: session.id };
}

export async function GET() {
  try {
    // TODO: This needs a real admin check. Currently allows any logged-in user.
    await requireUserId();

    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, createdAt: true, blacklisted: true },
      orderBy: { id: 'asc' },
    });

    // Decrypt user names before sending
    const decryptedUsers = users.map(user => ({
      ...user,
      name: user.name ? decrypt(user.name) : null,
    }));

    return NextResponse.json({ users: decryptedUsers });
  } catch (e) {
    logger.error({ err: e }, "[admin/users GET] error");
    if (e.message.includes("unauthorized")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}