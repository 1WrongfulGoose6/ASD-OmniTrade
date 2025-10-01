import { NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';
import { getUserIdFromCookies } from '@/utils/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// TEMP: just allow any logged-in user
async function requireAdmin() {
  const id = await getUserIdFromCookies();
  if (!id) return { error: 'not authenticated', code: 401 };
  return { ok: true, id };
}

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.code });

    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, createdAt: true, blacklisted: true, },
      orderBy: { id: 'asc' },
    });

    return NextResponse.json({ users });
  } catch (e) {
    return NextResponse.json({ error: e.message || 'server error' }, { status: 500 });
  }
}
