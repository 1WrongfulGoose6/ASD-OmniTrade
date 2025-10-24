import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getUserIdFromCookies } from "@/utils/auth";
import { validateRequestCsrf } from "@/utils/csrf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// DELETE /api/alerts/:id  (scoped to current user)
export async function DELETE(req, { params }) {
  const csrfFailure = validateRequestCsrf(req);
  if (csrfFailure) return csrfFailure;

  const userId = await getUserIdFromCookies();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const id = Number((await params)?.id);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "invalid_id" }, { status: 400 });

  // Ensure user owns the alert
  const row = await prisma.alert.findUnique({ where: { id } });
  if (!row || row.userId !== userId) return NextResponse.json({ error: "not_found" }, { status: 404 });

  await prisma.alert.delete({ where: { id } });
  return NextResponse.json({ ok: true }, { status: 200 });
}
