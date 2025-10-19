// src/app/api/admin/users/[id]/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';
import { getUserSession } from '@/utils/auth';

async function requireAdmin() {
  const session = await getUserSession();
  if (!session) return { error: 'not authenticated', code: 401 };
  if (session.role !== 'ADMIN') return { error: 'forbidden', code: 403 };
  return { ok: true, id: session.id };
}

// GET one user by id
export async function GET(req, { params }) {
  try {
    await requireUserId();
    const id = parseInt(params.id, 10);

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, createdAt: true, blacklisted: true },
    });

    if (!user) return NextResponse.json({ error: 'not found' }, { status: 404 });

    const responseUser = { ...user, name: user.name ? decrypt(user.name) : null };
    return NextResponse.json({ user: responseUser });
  } catch (e) {
    logger.error({ err: e }, "[admin/users/:id GET] error");
    if (e.message.includes("unauthorized")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

// UPDATE user by id
export async function PUT(req, { params }) {
  try {
    await verifyCsrf(req.headers);
    await requireUserId();
    const id = parseInt(params.id, 10);
    const body = await req.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'name and email required' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== id) {
      return NextResponse.json({ error: 'email already used' }, { status: 409 });
    }

    const data = { name: encrypt(name), email };

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true },
    });

    const responseUser = { ...updated, name: updated.name ? decrypt(updated.name) : null };
    return NextResponse.json({ user: responseUser });
  } catch (e) {
    logger.error({ err: e }, "[admin/users/:id PUT] error");
    if (e.message.includes("csrf") || e.message.includes("unauthorized")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

// DELETE user by id
export async function DELETE(req, { params }) {
  try {
    await verifyCsrf(req.headers);
    await requireUserId();
    const id = parseInt(params.id, 10);

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    logger.error({ err: e }, "[admin/users/:id DELETE] error");
    if (e.message.includes("csrf") || e.message.includes("unauthorized")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

// BLACKLIST user
export async function PATCH(req, { params }) {
  try {
    await verifyCsrf(req.headers);
    await requireUserId();
    const id = parseInt(params.id, 10);
    const body = await req.json();
    const { blacklisted } = body;

    const updated = await prisma.user.update({
      where: { id },
      data: { blacklisted },
      select: { id: true, name: true, email: true, blacklisted: true, createdAt: true },
    });

    const responseUser = { ...updated, name: updated.name ? decrypt(updated.name) : null };
    return NextResponse.json({ user: responseUser });
  } catch (e) {
    logger.error({ err: e }, "[admin/users/:id PATCH] error");
    if (e.message.includes("csrf") || e.message.includes("unauthorized")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
