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

    const body = await req.json();
    const amount = parseFloat(body.amount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid deposit amount" }, { status: 400 });
    }

    const deposit = await prisma.deposit.create({
      data: {
        amount,
        kind: "DEPOSIT",
        userId,
      },
    });

    auditLog("cash.deposit", userId, { amount });

    return NextResponse.json(deposit);
  } catch (err) {
    errorLog("cash.deposit.failed", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  let userId;
  try {
    userId = await getUserIdFromCookies();
    if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const items = await prisma.deposit.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ deposits: items }, { status: 200 });
  } catch (e) {
    errorLog("cash.deposit.list.failed", e, { userId });
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
