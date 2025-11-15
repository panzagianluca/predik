import { NextRequest, NextResponse } from "next/server";
import { setCachedHolders, getCachedHolders } from "@/lib/holdersCache";
import { logger } from "@/lib/logger";
import { db } from "@/lib/db";
import { marketTranslations } from "@predik/database";
import { eq } from "drizzle-orm";
import { translateMarketToSpanish as translateWithDeepL } from "@/lib/translation/deepl";

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
      const errorText = await response.text();
      logger.error(`❌ Myriad API error for ${slug}:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      return NextResponse.json(
        {
          error: `Failed to fetch market: ${response.statusText}`,
          details: errorText,
        },
        { status: response.status },
      );
    }

    const data = await response.json();

    // Log to verify price charts are included
    logger.log("📊 Market data for", slug, ":", {
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

          logger.log(
            `🔗 Found ${relatedMarkets.length} related markets for ${slug} (topic: ${primaryTopic})`,
          );
        }
      } catch (error) {
        logger.error("Error fetching related markets:", error);
        // Don't fail the main request if related markets fail
      }
    }

    // Add related markets to the response
    const responseData = {
      ...data,
      relatedMarkets,
    };

    // 🌐 TRANSLATION: Get Spanish translation from DB or create it
    const translatedData = await translateMarketToSpanish(responseData);

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
            logger.log(`⚡ Pre-warmed holders cache for ${slug}`);
          } catch (err) {
            // ignore
            logger.debug("Pre-warm holders failed:", err);
          }
        })();
      }
    } catch (err) {
      logger.debug("holders pre-warm error", err);
    }

    return NextResponse.json(translatedData, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    logger.error("Error fetching market:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch market",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

/**
 * Translate a single market to Spanish using cached DB translation or DeepL API
 */
async function translateMarketToSpanish(market: any): Promise<any> {
  if (!market) return market;

  // Check if translation exists in DB
  let translation = await db
    .select()
    .from(marketTranslations)
    .where(eq(marketTranslations.marketSlug, market.slug))
    .limit(1)
    .then((rows) => rows[0]);

  // If translation doesn't exist, create it
  if (!translation) {
    logger.log(
      `🆕 New market "${market.title}" (${market.slug}) - translating...`,
    );

    const { titleEs, descriptionEs } = await translateWithDeepL({
      title: market.title,
      description: market.description,
    });

    // Store in database for future use
    try {
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
    } catch (error: any) {
      // Handle race condition: another request already created the translation
      if (error.code === "23505" || error.message?.includes("duplicate key")) {
        logger.log(
          `⚡ Race condition detected for ${market.slug}, fetching existing translation...`,
        );
        // Fetch the translation that was created by the other request
        translation = await db
          .select()
          .from(marketTranslations)
          .where(eq(marketTranslations.marketSlug, market.slug))
          .limit(1)
          .then((rows) => rows[0]);

        if (!translation) {
          // If still not found, throw the original error
          throw error;
        }
      } else {
        // Re-throw any other errors
        throw error;
      }
    }
  }

  // Return market with Spanish translations
  return {
    ...market,
    titleEs: translation.titleEs,
    descriptionEs: translation.descriptionEs,
  };
}
