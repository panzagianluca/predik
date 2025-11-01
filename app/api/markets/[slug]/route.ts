import { NextRequest, NextResponse } from "next/server";
import { setCachedHolders, getCachedHolders } from "@/lib/holdersCache";

const MYRIAD_API_URL =
  process.env.NEXT_PUBLIC_MYRIAD_API_URL || "https://api-v2.myriadprotocol.com";
const MYRIAD_API_KEY = process.env.MYRIAD_API_KEY!; // SERVER-SIDE ONLY

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const response = await fetch(`${MYRIAD_API_URL}/markets/${slug}`, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": MYRIAD_API_KEY, // V2 authentication
      },
      next: { revalidate: 30 }, // Cache for 30 seconds
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch market: ${response.statusText}` },
        { status: response.status },
      );
    }

    const data = await response.json();

    // Log to verify price charts are included
    console.log("📊 Market data for", slug, ":", {
      title: data.title,
      outcomesCount: data.outcomes?.length,
      firstOutcomeFields: data.outcomes?.[0]
        ? Object.keys(data.outcomes[0])
        : [],
      firstOutcomeHasPriceCharts: !!data.outcomes?.[0]?.priceCharts,
      firstOutcomeHasPrice_charts: !!data.outcomes?.[0]?.price_charts,
      chartsCount:
        data.outcomes?.[0]?.priceCharts?.length ||
        data.outcomes?.[0]?.price_charts?.length,
    });

    // Fetch related markets based on topics/tags
    let relatedMarkets = [];
    if (data.topics && data.topics.length > 0) {
      try {
        // Get the first topic to search for related markets
        const primaryTopic = data.topics[0];

        const relatedResponse = await fetch(
          `${MYRIAD_API_URL}/markets?${new URLSearchParams({
            network_id: "56",
            token_address:
              process.env.NEXT_PUBLIC_USDT_TOKEN_ADDRESS ||
              "0x55d398326f99059fF775485246999027B3197955",
            topics: primaryTopic,
            state: "open", // Only show open markets as related
            sort: "volume",
            order: "desc",
            limit: "10", // Fetch more to filter out current market and have enough
          })}`,
          {
            headers: {
              "Content-Type": "application/json",
              "x-api-key": MYRIAD_API_KEY,
            },
            next: { revalidate: 60 }, // Cache related markets for 1 minute
          },
        );

        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json();
          // Filter out current market and limit to 4
          relatedMarkets = (relatedData.data || relatedData)
            .filter((m: any) => m.slug !== slug && m.slug !== data.slug)
            .slice(0, 4);

          console.log(
            `🔗 Found ${relatedMarkets.length} related markets for ${slug} (topic: ${primaryTopic})`,
          );
        }
      } catch (error) {
        console.error("Error fetching related markets:", error);
        // Don't fail the main request if related markets fail
      }
    }

    // Add related markets to the response
    const responseData = {
      ...data,
      relatedMarkets,
    };

    // Fire-and-forget: pre-warm holders cache so the Holders tab can show results instantly
    try {
      const NETWORK_ID = process.env.NEXT_PUBLIC_NETWORK_ID || "56";
      // If there's already cached holders, skip
      if (!getCachedHolders(slug)) {
        (async () => {
          try {
            const marketId = data.id;
            if (!marketId) return;
            const holdersRes = await fetch(
              `${
                process.env.NEXT_PUBLIC_MYRIAD_API_URL ||
                "https://api-v2.myriadprotocol.com"
              }/markets/${marketId}/holders?network_id=${NETWORK_ID}&limit=20`,
              {
                headers: {
                  "Content-Type": "application/json",
                  "x-api-key": process.env.MYRIAD_API_KEY || "",
                },
              },
            );
            if (!holdersRes.ok) return;
            const holdersApiResponse = await holdersRes.json();
            const holdersApiData =
              holdersApiResponse.data || holdersApiResponse;
            const holdersData = {
              marketId,
              outcomes: holdersApiData.map((outcomeData: any) => ({
                id: outcomeData.outcomeId || outcomeData.outcome_id,
                title: outcomeData.outcomeTitle || outcomeData.outcome_title,
                holders: (outcomeData.holders || []).map((holder: any) => ({
                  address: holder.user,
                  shares: holder.shares.toFixed(2),
                })),
              })),
              cachedAt: new Date().toISOString(),
            };
            setCachedHolders(slug, holdersData);
            console.log(`⚡ Pre-warmed holders cache for ${slug}`);
          } catch (err) {
            // ignore
            console.debug("Pre-warm holders failed:", err);
          }
        })();
      }
    } catch (err) {
      console.debug("holders pre-warm error", err);
    }

    return NextResponse.json(responseData, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("Error fetching market:", error);
    return NextResponse.json(
      { error: "Failed to fetch market" },
      { status: 500 },
    );
  }
}
