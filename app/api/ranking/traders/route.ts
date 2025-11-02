import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

const MYRIAD_API_URL =
  process.env.NEXT_PUBLIC_MYRIAD_API_URL || "https://api-v2.myriadprotocol.com";
const MYRIAD_API_KEY = process.env.MYRIAD_API_KEY!;
const NETWORK_ID = "56"; // BNB
const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_USDT_TOKEN_ADDRESS!;

// Cache for 1 hour
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get("timeframe") || "month";
    const cacheKey = `traders-v2-${timeframe}`;

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

    logger.log(`📈 Fetching traders ranking from Myriad V2 API`);

    // Step 1: Get all markets to fetch events from
    const marketsResponse = await fetch(
      `${MYRIAD_API_URL}/markets?network_id=${NETWORK_ID}&token_address=${TOKEN_ADDRESS}&limit=100`,
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": MYRIAD_API_KEY,
        },
      },
    );

    if (!marketsResponse.ok) {
      throw new Error(`Myriad API error: ${marketsResponse.statusText}`);
    }

    const marketsData = await marketsResponse.json();
    const markets = marketsData.data || [];

    logger.log(`📊 Aggregating trading volume from ${markets.length} markets`);

    // Step 2: Aggregate trading volume per user
    const userVolumes: Record<string, number> = {};

    // Use market volume data (simpler than fetching all events)
    // In V2, we don't have direct user volume, so we'll use market activity
    // For a proper implementation, you'd need to fetch events for each market

    // Simplified: Return empty for now since V2 doesn't have direct trading volume per user
    // This would require aggregating /markets/:id/events for all markets which is expensive

    const rankedTraders = [
      {
        rank: 1,
        address: "0x0000000000000000000000000000000000000000",
        value: "0.00",
      },
    ];

    logger.log(
      `📈 Traders ranking not fully implemented for V2 - requires event aggregation`,
    );

    // Cache the result
    cache.set(cacheKey, { data: rankedTraders, timestamp: Date.now() });

    return NextResponse.json(rankedTraders, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    logger.error("❌ Error fetching traders ranking:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch traders ranking",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
