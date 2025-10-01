// src/app/api/admin/users/[id]/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';
import bcrypt from 'bcryptjs';
import { getUserIdFromCookies } from '@/utils/auth';

async function requireAdmin() {
  const id = await getUserIdFromCookies();
  if (!id) return { error: 'not authenticated', code: 401 };
  // Simplified 
  return { ok: true, id };
}

// GET one user by id
export async function GET(req, { params }) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.code });

    const id = parseInt(params.id, 10);
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, createdAt: true }
    });
    if (!user) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json({ user });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// UPDATE user by id
export async function PUT(req, { params }) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.code });

    const id = parseInt(params.id, 10);
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'name and email required' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== id) {
      return NextResponse.json({ error: 'email already used' }, { status: 409 });
    }

    const data = { name, email };
    if (password) {
      if (password.length < 8) {
        return NextResponse.json({ error: 'password too short' }, { status: 400 });
      }
      data.passwordHash = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ user: updated });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE user by id
export async function DELETE(req, { params }) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.code });

    const id = parseInt(params.id, 10);
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
