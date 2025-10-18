// src/app/api/withdraw/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { requireUserId, verifyCsrf } from "@/utils/auth";
import logger from "@/utils/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    await verifyCsrf(req.headers);
    const userId = await requireUserId();

    const body = await req.json();
    let amount = parseFloat(body.amount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid withdrawal amount" }, { status: 400 });
    }

    // Reverse signage for temporary workaround
    amount = -Math.abs(amount);

    // --- Check available cash ---
    const cashAgg = await prisma.deposit.aggregate({
      _sum: { amount: true },
      where: { userId },
    });
    const availableCash = Number(cashAgg._sum.amount || 0);

    if (Math.abs(amount) > availableCash) {
      return NextResponse.json(
        { error: `Insufficient funds. Available cash: ${availableCash.toFixed(2)} AUD` },
        { status: 400 }
      );
    }

    // --- Store as negative deposit ---
    const withdrawalRecord = await prisma.deposit.create({
      data: {
        amount,
        userId,
      },
    });

    return NextResponse.json(withdrawalRecord);
  } catch (err) {
    logger.error({ err }, "[withdraw POST] error");
    if (err.message.includes("csrf") || err.message.includes("unauthorized")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const userId = await requireUserId();

    // Fetch only negative amounts to show withdrawals
    const items = await prisma.deposit.findMany({
      where: { userId, amount: { lt: 0 } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ withdrawals: items }, { status: 200 });
  } catch (e) {
    logger.error({ err: e }, "[withdraw GET] error");
    if (e.message.includes("unauthorized")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}