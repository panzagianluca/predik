import { NextRequest, NextResponse } from "next/server";

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

    return NextResponse.json(data, {
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
