// src/app/api/withdraw/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getUserIdFromCookies } from "@/utils/auth";
import { getCashBalance } from "@/lib/server/portfolio";
import { validateRequestCsrf } from "@/utils/csrf";
import { auditLog, errorLog } from "@/utils/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const csrfFailure = validateRequestCsrf(req);
    if (csrfFailure) return csrfFailure;

    const userId = await getUserIdFromCookies();
    if (!userId) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

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

    auditLog("cash.withdrawal", userId, { amount });

    return NextResponse.json({ ...withdrawalRecord, amount: -Math.abs(amount) });
  } catch (err) {
    errorLog("cash.withdrawal.failed", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  let userId;
  try {
    userId = await getUserIdFromCookies();
    if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

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

    const normalized = items.map((item) => ({
      ...item,
      amount: item.kind === "WITHDRAW" ? -Math.abs(item.amount) : item.amount,
    }));

    return NextResponse.json({ withdrawals: normalized }, { status: 200 });
  } catch (e) {
    errorLog("cash.withdrawal.list.failed", e, { userId });
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
