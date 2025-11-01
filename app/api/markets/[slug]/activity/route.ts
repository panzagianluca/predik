import { NextRequest, NextResponse } from "next/server";

const MYRIAD_API_URL =
  process.env.NEXT_PUBLIC_MYRIAD_API_URL || "https://api-v2.myriadprotocol.com";
const MYRIAD_API_KEY = process.env.MYRIAD_API_KEY!;

// In-memory cache for 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    // Check cache
    const cached = cache.get(slug);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data, {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          "X-Cache": "HIT",
        },
      });
    }

    console.log(`🔍 Fetching activity for market ${slug} from Myriad API...`);

    // Calculate 24 hours ago
    const since = Math.floor(Date.now() / 1000) - 24 * 60 * 60;

    // Fetch events from Myriad API V2
    const eventsRes = await fetch(
      `${MYRIAD_API_URL}/markets/${slug}/events?since=${since}&limit=100`,
      {
        headers: {
          "x-api-key": MYRIAD_API_KEY,
        },
      },
    );

    if (!eventsRes.ok) {
      console.error(`Failed to fetch events: ${eventsRes.status}`);
      throw new Error("Failed to fetch market events");
    }

    const eventsData = await eventsRes.json();
    console.log(`📝 Found ${eventsData.data?.length || 0} events in last 24h`);

    // Transform to our format - only include buy/sell actions
    const activities = (eventsData.data || [])
      .filter((event: any) => event.action === "buy" || event.action === "sell")
      .map((event: any) => ({
        user: event.user,
        outcome: event.outcomeTitle,
        side: event.action === "buy" ? "Buy" : "Sell",
        shares: event.shares?.toString() || "0",
        timestamp: event.timestamp,
        txHash: event.transactionHash || "",
      }));

    const result = {
      marketId: slug,
      activities,
      cachedAt: new Date().toISOString(),
    };

    // Cache the result
    cache.set(slug, { data: result, timestamp: Date.now() });

    console.log(`✅ Found ${activities.length} activities for market ${slug}`);

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("❌ Error fetching activity:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch market activity",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
