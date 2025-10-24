import { NextResponse } from "next/server";
import { getUserIdFromCookies } from "@/utils/auth";
import { buildPortfolioSnapshot } from "@/lib/server/portfolio";
import { errorLog } from "@/utils/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getUserIdFromCookies();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const snapshot = await buildPortfolioSnapshot(userId);
    const holdings = snapshot.holdings.map(({ firstHeldAt, ...rest }) => rest);

    return NextResponse.json(
      {
        holdings,
        totals: {
          totalValue: snapshot.totals.totalValue,
          totalProfitLoss: snapshot.totals.totalProfitLoss,
          cashAud: snapshot.cash,
        },
        totalsWithCash: {
          totalValue: snapshot.netWorth,
          totalProfitLoss: snapshot.totals.totalProfitLoss,
        },
      },
      { status: 200 }
    );
  } catch (e) {
    errorLog("portfolio.snapshot.failed", e, { userId });
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
