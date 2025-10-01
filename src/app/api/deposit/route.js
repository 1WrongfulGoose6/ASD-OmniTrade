import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getUserIdFromCookies } from "@/utils/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const userId = await getUserIdFromCookies();
    if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    let body;
    try { body = await req.json(); }
    catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }

    const amount = Number(body?.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "amount must be > 0" }, { status: 400 });
    }

    const dep = await prisma.deposit.create({
      data: { userId, amount },
      select: { id: true, amount: true, createdAt: true },
    });

    return NextResponse.json({ ok: true, deposit: dep }, { status: 200 });
  } catch (e) {
    console.error("[deposits POST] error", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const userId = await getUserIdFromCookies();
    if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const items = await prisma.deposit.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ deposits: items }, { status: 200 });
  } catch (e) {
    console.error("[deposits GET] error", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
