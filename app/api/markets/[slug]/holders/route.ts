import { NextRequest, NextResponse } from "next/server";
import { getCachedHolders, setCachedHolders } from "@/lib/holdersCache";

const MYRIAD_API_URL =
  process.env.NEXT_PUBLIC_MYRIAD_API_URL || "https://api-v2.myriadprotocol.com";
const MYRIAD_API_KEY = process.env.MYRIAD_API_KEY!; // SERVER-SIDE ONLY
const NETWORK_ID = process.env.NEXT_PUBLIC_NETWORK_ID || "56"; // BSC mainnet

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    console.log(`🔍 Fetching holders for market: ${slug}`);

    // Check cache (shared)
    const shared = getCachedHolders(slug);
    if (shared) {
      console.log(`✅ Cache HIT for ${slug}`);
      return NextResponse.json(shared, {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          "X-Cache": "HIT",
        },
      });
    }

    // Fetch market data first to get marketId
    const marketResponse = await fetch(`${MYRIAD_API_URL}/markets/${slug}`, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": MYRIAD_API_KEY,
      },
    });

    if (!marketResponse.ok) {
      console.error(`❌ Market not found: ${slug}`);
      return NextResponse.json({ error: "Market not found" }, { status: 404 });
    }

    const market = await marketResponse.json();
    const marketId = market.id;

    console.log(`� Market ID: ${marketId}, fetching holders from V2 API...`);

    // Fetch holders from Myriad V2 API
    const holdersResponse = await fetch(
      `${MYRIAD_API_URL}/markets/${marketId}/holders?network_id=${NETWORK_ID}&limit=20`,
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": MYRIAD_API_KEY,
        },
      },
    );

    if (!holdersResponse.ok) {
      console.error(
        `❌ Failed to fetch holders: ${holdersResponse.status} ${holdersResponse.statusText}`,
      );
      throw new Error(`Failed to fetch holders: ${holdersResponse.statusText}`);
    }

    const holdersApiResponse = await holdersResponse.json();

    console.log(
      `✅ V2 API returned holders data:`,
      JSON.stringify(holdersApiResponse, null, 2),
    );

    // Extract data array from the response - API returns { data: [...], pagination: {...} }
    const holdersApiData = holdersApiResponse.data || holdersApiResponse;

    // Transform V2 API response to match HoldersList component expectations
    // V2 returns: { outcomeId, outcomeTitle, totalHolders, holders: [{ user, shares }] }[]
    const holdersData = {
      marketId,
      outcomes: holdersApiData.map((outcomeData: any) => ({
        id: outcomeData.outcomeId || outcomeData.outcome_id,
        title: outcomeData.outcomeTitle || outcomeData.outcome_title,
        holders: (outcomeData.holders || []).map((holder: any) => ({
          address: holder.user,
          shares: holder.shares.toFixed(2), // Format shares to 2 decimal places
        })),
      })),
      cachedAt: new Date().toISOString(),
    };

    console.log(
      `✅ Transformed holders:`,
      holdersData.outcomes
        .map((o: any) => `${o.title}: ${o.holders.length} holders`)
        .join(", "),
    );

    // Cache for 5 minutes (shared)
    setCachedHolders(slug, holdersData);

    return NextResponse.json(holdersData, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("❌ Error fetching holders:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch holders",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
