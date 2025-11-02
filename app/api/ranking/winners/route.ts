import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

// Cache for 1 hour
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get("timeframe") || "month";
    const cacheKey = `winners-v2-${timeframe}`;

    // Check cache
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data, {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
          "X-Cache": "HIT",
        },
      });
    }

    logger.log(`🏆 Winners ranking not fully implemented for Myriad V2`);

    // Myriad V2 doesn't have a direct "winners" endpoint
    // Would need to aggregate user portfolios and calculate P&L
    // Return empty for now

    const rankedWinners = [
      {
        rank: 1,
        address: "0x0000000000000000000000000000000000000000",
        value: "0.00",
      },
    ];

    // Cache the result
    cache.set(cacheKey, { data: rankedWinners, timestamp: Date.now() });

    return NextResponse.json(rankedWinners, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    logger.error("❌ Error fetching winners ranking:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch winners ranking",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
