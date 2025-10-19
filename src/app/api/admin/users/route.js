import { NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';
import { getUserSession } from '@/utils/auth';
import { decryptField } from '@/utils/encryption';

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
    const auth = await requireAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.code });

    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, createdAt: true, blacklisted: true, },
      orderBy: { id: 'asc' },
    });

    const sanitized = users.map((user) => ({
      ...user,
      name: decryptField(user.name),
    }));

    return NextResponse.json({ users: sanitized });
  } catch (e) {
    return NextResponse.json({ error: e.message || 'server error' }, { status: 500 });
  }
}
