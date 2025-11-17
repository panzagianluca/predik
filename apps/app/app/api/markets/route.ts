import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { db } from "@/lib/db";
import { marketTranslations } from "@predik/database";
import { inArray } from "drizzle-orm";
import { translateMarketToSpanish } from "@/lib/translation/deepl";

const MYRIAD_API_URL =
  process.env.NEXT_PUBLIC_MYRIAD_API_URL || "https://api-v2.myriadprotocol.com";
const MYRIAD_API_KEY = process.env.MYRIAD_API_KEY!; // SERVER-SIDE ONLY

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Build V2 params
    const params = new URLSearchParams();

    // Required params (defaults for BNB)
    params.set("network_id", searchParams.get("network_id") || "56"); // BNB default
    params.set(
      "token_address",
      searchParams.get("token_address") ||
        process.env.NEXT_PUBLIC_USDT_TOKEN_ADDRESS!,
    ); // USDT BNB default

    // Optional filters
    const state = searchParams.get("state");
    const keyword = searchParams.get("keyword");
    const topics = searchParams.get("topics");
    const sort = searchParams.get("sort");
    const order = searchParams.get("order");
    const requestedPage = searchParams.get("page");
    const requestedLimit = searchParams.get("limit");
    const fetchAll = searchParams.get("fetch_all") === "true";

    if (state) params.set("state", state);
    if (keyword) params.set("keyword", keyword);
    if (topics) params.set("topics", topics);
    if (sort) params.set("sort", sort);
    if (order) params.set("order", order);

    // If fetch_all is true, paginate through all results
    if (fetchAll) {
      logger.log("📡 Fetching ALL markets with pagination...");

      let allMarkets: any[] = [];
      let currentPage = 1;
      let hasMorePages = true;
      const pageLimit = "100"; // Fetch 100 per page for efficiency

      while (hasMorePages) {
        const pageParams = new URLSearchParams(params);
        pageParams.set("page", String(currentPage));
        pageParams.set("limit", pageLimit);

        const response = await fetch(
          `${MYRIAD_API_URL}/markets?${pageParams}`,
          {
            headers: {
              "Content-Type": "application/json",
              "x-api-key": MYRIAD_API_KEY,
            },
            next: { revalidate: 30 },
          },
        );

        if (!response.ok) {
          logger.error(
            "❌ Myriad V2 API error:",
            response.status,
            response.statusText,
          );
          break;
        }

        const responseData = await response.json();
        const markets = responseData.data || responseData;
        const pagination = responseData.pagination;

        allMarkets = allMarkets.concat(markets);

        logger.log(
          `📄 Fetched page ${currentPage}: ${markets.length} markets (total so far: ${allMarkets.length})`,
        );

        // Check if there are more pages
        if (pagination && pagination.page < pagination.totalPages) {
          currentPage++;
        } else {
          hasMorePages = false;
        }
      }

      logger.log(`✅ Fetched ALL ${allMarkets.length} markets from Myriad`);

      // 🌐 TRANSLATION: Get Spanish translations from DB or create them
      const translatedMarkets = await translateMarketsToSpanish(allMarkets);

      return NextResponse.json(translatedMarkets, {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      });
    }

    // Single page request (backward compatible)
    if (requestedPage) params.set("page", requestedPage);
    if (requestedLimit) params.set("limit", requestedLimit);

    const response = await fetch(`${MYRIAD_API_URL}/markets?${params}`, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": MYRIAD_API_KEY, // V2 requires authentication
      },
      next: { revalidate: 30 }, // Cache for 30 seconds, then revalidate
    });

    logger.log(
      "📡 Myriad V2 API request:",
      `${MYRIAD_API_URL}/markets?${params}`,
    );

    if (!response.ok) {
      logger.error(
        "❌ Myriad V2 API error:",
        response.status,
        response.statusText,
      );
      return NextResponse.json(
        { error: `Myriad API error: ${response.statusText}` },
        { status: response.status },
      );
    }

    const responseData = await response.json();

    // Myriad V2 returns paginated response with { data: [], pagination: {} }
    // Extract the markets array from the data field
    const markets = responseData.data || responseData;
    const pagination = responseData.pagination;

    logger.log("✅ Myriad V2 API response:", markets.length || 0, "markets");

    // 🌐 TRANSLATION: Get Spanish translations from DB or create them
    const translatedMarkets = await translateMarketsToSpanish(markets);

    return NextResponse.json(translatedMarkets, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        // Include pagination info in custom header if needed
        ...(pagination && { "X-Pagination": JSON.stringify(pagination) }),
      },
    });
  } catch (error) {
    logger.error("Error fetching markets:", error);
    return NextResponse.json(
      { error: "Failed to fetch markets from Myriad V2" },
      { status: 500 },
    );
  }
}

/**
 * Translate markets to Spanish using cached DB translations or DeepL API
 */
async function translateMarketsToSpanish(markets: any[]): Promise<any[]> {
  if (!markets || markets.length === 0) return markets;

  // Get market IDs
  const marketIds = markets.map((m) => m.id);

  // Fetch existing translations from DB
  const existingTranslations = await db
    .select()
    .from(marketTranslations)
    .where(inArray(marketTranslations.marketId, marketIds));

  // Map translations by market ID for fast lookup
  const translationMap = new Map(
    existingTranslations.map((t) => [t.marketId, t]),
  );

  // Translate markets in parallel
  const spanishMarkets = await Promise.all(
    markets.map(async (market) => {
      let translation = translationMap.get(market.id);

      // If translation doesn't exist, create it
      if (!translation) {
        logger.log(
          `🆕 New market detected: "${market.title}" - translating...`,
        );

        const { titleEs, descriptionEs } = await translateMarketToSpanish({
          title: market.title,
          description: market.description,
        });

        // Store in database for future use
        const [newTranslation] = await db
          .insert(marketTranslations)
          .values({
            marketId: market.id,
            marketSlug: market.slug,
            titleEs,
            descriptionEs,
            titleEn: market.title,
            descriptionEn: market.description,
          })
          .returning();

        translation = newTranslation;
      }

      // Return market with Spanish translations
      return {
        ...market,
        titleEs: translation.titleEs,
        descriptionEs: translation.descriptionEs,
      };
    }),
  );

  return spanishMarkets;
}
