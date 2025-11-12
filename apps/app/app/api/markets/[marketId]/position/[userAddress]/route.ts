import { NextRequest, NextResponse } from "next/server";
import { getHolderShares } from "@/lib/getHolderShares";
import { logger } from "@/lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ marketId: string; userAddress: string }> },
) {
  try {
    const { marketId, userAddress } = await params;

    // Validate inputs
    if (!marketId || isNaN(Number(marketId))) {
      return NextResponse.json({ error: "Invalid marketId" }, { status: 400 });
    }

    if (!userAddress || !/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return NextResponse.json(
        { error: "Invalid userAddress" },
        { status: 400 },
      );
    }

    logger.log(
      `📊 Fetching position for market ${marketId}, user ${userAddress}`,
    );

    // Use server-side getHolderShares which always queries BNB RPC
    const { liquidityShares, outcomeShares } = await getHolderShares(
      Number(marketId),
      userAddress,
    );

    return NextResponse.json(
      {
        marketId: Number(marketId),
        userAddress,
        liquidityShares: liquidityShares.toString(),
        outcomeShares: outcomeShares.map((s) => s.toString()),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
        },
      },
    );
  } catch (error) {
    logger.error("Error fetching user position:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch user position",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
