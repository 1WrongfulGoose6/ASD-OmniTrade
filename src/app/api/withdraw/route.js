// src/app/api/withdraw/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getUserIdFromCookies } from "@/utils/auth";
import { getCashBalance } from "@/lib/server/portfolio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    await verifyCsrf(req.headers);
    const userId = await requireUserId();

    const body = await req.json();
    const amountValue = parseFloat(body.amount);
    let amount = amountValue;
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid withdrawal amount" }, { status: 400 });
    }

    // --- Check available cash ---
    const { availableCash } = await getCashBalance(userId);

    if (amount > availableCash) {
      return NextResponse.json(
        { error: `Insufficient funds. Available cash: ${availableCash.toFixed(2)} AUD` },
        { status: 400 }
      );
    }

    // --- Store as withdrawal entry ---
    const withdrawalRecord = await prisma.deposit.create({
      data: {
        amount,
        kind: "WITHDRAW",
        userId,
      },
    });

    return NextResponse.json({ ...withdrawalRecord, amount: -Math.abs(amount) });
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

    // Fetch withdrawals (supporting legacy negative entries)
    const items = await prisma.deposit.findMany({
      where: {
        userId,
        OR: [
          { kind: "WITHDRAW" },
          { amount: { lt: 0 } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

<<<<<<< HEAD
    return NextResponse.json({ withdrawals: items }, { status: 200 });
=======
    const normalized = items.map((item) => ({
      ...item,
      amount: item.kind === "WITHDRAW" ? -Math.abs(item.amount) : item.amount,
    }));

    return NextResponse.json({ withdrawals: normalized }, { status: 200 });
>>>>>>> main
  } catch (e) {
    logger.error({ err: e }, "[withdraw GET] error");
    if (e.message.includes("unauthorized")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}