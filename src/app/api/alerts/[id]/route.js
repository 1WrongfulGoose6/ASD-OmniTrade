// src/app/api/alerts/[id]/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { requireUserId, verifyCsrf } from "@/utils/auth";
import logger from "@/utils/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// DELETE /api/alerts/:id  (scoped to current user)
export async function DELETE(req, { params }) {
  try {
    await verifyCsrf(req.headers);
    const userId = await requireUserId();

    const id = Number(params?.id);
    if (!Number.isFinite(id)) return NextResponse.json({ error: "invalid_id" }, { status: 400 });

    // Ensure user owns the alert
    const row = await prisma.alert.findUnique({ where: { id } });
    if (!row || row.userId !== userId) return NextResponse.json({ error: "not_found" }, { status: 404 });

    await prisma.alert.delete({ where: { id } });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    logger.error({ err: e }, "[alerts/:id DELETE] error");
    if (e.message.includes("csrf") || e.message.includes("unauthorized")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}