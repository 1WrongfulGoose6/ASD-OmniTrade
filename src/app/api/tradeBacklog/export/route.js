// src/app/api/tradeBacklog/export/route.js
import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/utils/prisma";
import { getUserIdFromCookies } from "@/utils/auth";
import { validateRequestCsrf } from "@/utils/csrf";
import { convertToCSV } from "@/app/trade-backlog/lib/csv";
import { auditLog } from "@/utils/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EXPORT_LIMIT = 500;

export async function POST(request) {
  const csrfFailure = validateRequestCsrf(request);
  if (csrfFailure) return csrfFailure;

  const userId = await getUserIdFromCookies();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const rows = await prisma.tradeBacklog.findMany({
    where: { userId: Number(userId) },
    orderBy: { date: "desc" },
    take: EXPORT_LIMIT,
    select: {
      id: true,
      asset: true,
      type: true,
      amount: true,
      status: true,
      date: true,
    },
  });

  const csv = convertToCSV(rows);
  const checksum = crypto.createHash("sha256").update(csv, "utf8").digest("hex");

  auditLog("trade.export.csv", userId, {
    rows: rows.length,
    checksum,
  });

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="trade_export_${Date.now()}.csv"`,
      "Cache-Control": "no-store",
      "X-Checksum": checksum,
    },
  });
}
