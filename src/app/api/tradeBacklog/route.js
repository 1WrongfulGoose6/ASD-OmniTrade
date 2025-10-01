import {prisma} from "@/utils/prisma";
import {getUserIdFromCookies} from "@/utils/auth"; // make sure prisma client path is correct

export async function GET() {
    const userId = await getUserIdFromCookies();
    console.log(userId);
    // Validate userId
    const userIdNum = parseInt(userId, 10);
    if (isNaN(userIdNum)) {
        return new Response(
            JSON.stringify({ error: "Invalid userId" }),
            { status: 400 }
        );
    }

    try {
        // Query TradeBacklog by userId
        const tradeBacklogs = await prisma.tradeBacklog.findMany({
            where: { userId: userIdNum },
            orderBy: { date: "desc" }, // latest first
        });

        return new Response(JSON.stringify(tradeBacklogs), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error fetching TradeBacklog:", error);
        return new Response(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500 }
        );
    }
}
