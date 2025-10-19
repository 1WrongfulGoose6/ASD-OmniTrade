import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getUserIdFromCookies } from "@/utils/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
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

    return NextResponse.json(deposit);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
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

    console.log("Deposits found:", items);

    return NextResponse.json({ deposits: items }, { status: 200 });
  } catch (e) {
    console.error("[deposits GET] error", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
