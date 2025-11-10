import { MarketsGrid } from "@/components/market/MarketsGrid";
import { LogoSpinner } from "@/components/ui/logo-spinner";
import { Suspense } from "react";
import { logger } from "@/lib/logger";
import { db } from "@/lib/db";
import { marketTranslations } from "@predik/database";
import { inArray } from "drizzle-orm";
import { translateMarketToSpanish } from "@/lib/translation/deepl";

// Force dynamic rendering (don't prerender at build time)

const MYRIAD_API_URL =
  process.env.NEXT_PUBLIC_MYRIAD_API_URL || "https://api-v2.myriadprotocol.com";
const MYRIAD_API_KEY = process.env.MYRIAD_API_KEY!;

async function getMarkets() {
  try {
    const baseParams = {
      network_id: "56", // BNB Smart Chain
      token_address:
        process.env.NEXT_PUBLIC_USDT_TOKEN_ADDRESS ||
        "0x55d398326f99059fF775485246999027B3197955",
      sort: "volume",
      order: "desc",
      limit: "50",
    };

    // Fetch open, closed, and resolved markets in parallel from Myriad
    const [openRes, closedRes, resolvedRes] = await Promise.all([
      fetch(
        `${MYRIAD_API_URL}/markets?${new URLSearchParams({
          ...baseParams,
          state: "open",
        })}`,
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": MYRIAD_API_KEY,
          },
          next: { revalidate: 30 },
        },
      ),
      fetch(
        `${MYRIAD_API_URL}/markets?${new URLSearchParams({
          ...baseParams,
          state: "closed",
        })}`,
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": MYRIAD_API_KEY,
          },
          next: { revalidate: 30 },
        },
      ),
      fetch(
        `${MYRIAD_API_URL}/markets?${new URLSearchParams({
          ...baseParams,
          state: "resolved",
        })}`,
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": MYRIAD_API_KEY,
          },
          next: { revalidate: 30 },
        },
      ),
    ]);

    const [openData, closedData, resolvedData] = await Promise.all([
      openRes.ok ? openRes.json() : { data: [] },
      closedRes.ok ? closedRes.json() : { data: [] },
      resolvedRes.ok ? resolvedRes.json() : { data: [] },
    ]);

    // Combine all markets
    const allMarkets = [
      ...(openData.data || []),
      ...(closedData.data || []),
      ...(resolvedData.data || []),
    ].filter(
      (market) =>
        // Exclude test markets
        !market.title.toLowerCase().includes("test usd") &&
        !market.slug.includes("test-usd") &&
        // Exclude BNB Candles markets
        !market.title.toLowerCase().includes("bnb candles") &&
        !market.slug.includes("bnb-candles"),
    );

    // 🌐 Add Spanish translations
    const translatedMarkets = await translateMarketsToSpanish(allMarkets);

    logger.log(
      "✅ Home page loaded",
      translatedMarkets.length,
      "markets (open:",
      openData.data?.length || 0,
      ", closed:",
      closedData.data?.length || 0,
      ", resolved:",
      resolvedData.data?.length || 0,
      ")",
    );
    return translatedMarkets;
  } catch (err) {
    logger.error("Error loading markets:", err);
    return [];
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

export default async function Home() {
  const markets = await getMarkets();

  return (
    <div className="bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <h1 className="text-[30px] mb-4">El futuro tiene precio</h1>

        {/* Market Grid Section */}
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <LogoSpinner size={32} />
            </div>
          }
        >
          <MarketsGrid markets={markets} />
        </Suspense>
      </div>
    </div>
  );
}
