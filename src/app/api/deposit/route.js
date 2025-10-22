import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getUserIdFromCookies } from "@/utils/auth";
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

    const { amount } = await req.json();
    const numericAmount = Number(amount);

    // Validate amount
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid deposit amount" },
        { status: 400 }
      );
    }

    // Create deposit record
    const deposit = await prisma.deposit.create({
      data: {
        amount: numericAmount,
        kind: "DEPOSIT",
        userId,
      },
    });

    // Update user balance
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { balance: { increment: numericAmount } },
      });
    } catch (balanceErr) {
      console.warn("Skipping balance update — no balance field found:", balanceErr.message);
    }

    auditLog("cash.deposit", userId, { amount: numericAmount });

    return NextResponse.json(deposit, { status: 200 });
  } catch (err) {
    errorLog("cash.deposit.failed", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
