// src/app/api/bookmarks/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { requireUserId, verifyCsrf } from "@/utils/auth";
import logger from "@/utils/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/bookmarks  -> list current user's bookmarks
export async function GET() {
  try {
    const userId = await requireUserId();

    const rows = await prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { articleId: true, title: true, url: true, createdAt: true },
    });

    return NextResponse.json({ bookmarks: rows });
  } catch (e) {
    logger.error({ err: e }, "[bookmarks GET] error");
    if (e.message.includes("unauthorized")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

// POST /api/bookmarks  -> upsert a bookmark
// body: { articleId, title?, url? }
export async function POST(request) {
  try {
    await verifyCsrf(request.headers);
    const userId = await requireUserId();

    const body = await request.json();
    let { articleId, title, url } = body || {};
    if (articleId == null || articleId === "") {
      return NextResponse.json({ error: "articleId required" }, { status: 400 });
    }

    const idStr = String(articleId); // <-- normalize to String

    const row = await prisma.bookmark.upsert({
      where: { userId_articleId: { userId, articleId: idStr } },
      create: { userId, articleId: idStr, title, url },
      update: { title, url },
    });

    return NextResponse.json({ ok: true, bookmark: row }, { status: 200 });
  } catch (e) {
    logger.error({ err: e }, "[bookmarks POST] error");
    if (e.message.includes("csrf") || e.message.includes("unauthorized")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

// DELETE /api/bookmarks?articleId=...
export async function DELETE(request) {
  try {
    await verifyCsrf(request.headers);
    const userId = await requireUserId();

    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get("articleId");
    if (!articleId) return NextResponse.json({ error: "articleId required" }, { status: 400 });

    try {
      await prisma.bookmark.delete({
        where: { userId_articleId: { userId, articleId: String(articleId) } },
      });
    } catch {
      // If it wasn't there, that's fine — act idempotent
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    logger.error({ err: e }, "[bookmarks DELETE] error");
    if (e.message.includes("csrf") || e.message.includes("unauthorized")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}