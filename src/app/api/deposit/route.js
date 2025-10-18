// src/app/api/deposit/route.js
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
    const amount = parseFloat(body.amount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid deposit amount" }, { status: 400 });
    }

    const deposit = await prisma.deposit.create({
      data: {
        amount,
        userId,
      },
    });

    return NextResponse.json(deposit);
  } catch (err) {
    logger.error({ err }, "[deposit POST] error");
    if (err.message.includes("csrf") || err.message.includes("unauthorized")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const userId = await requireUserId();

    const items = await prisma.deposit.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ deposits: items }, { status: 200 });
  } catch (e) {
    logger.error({ err: e }, "[deposits GET] error");
    if (e.message.includes("unauthorized")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}