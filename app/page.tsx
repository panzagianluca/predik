import { MarketsGrid } from "@/components/market/MarketsGrid";
import { LogoSpinner } from "@/components/ui/logo-spinner";
import { Suspense } from "react";
import { logger } from "@/lib/logger";

async function getMarkets() {
  try {
    // Use our internal API endpoint which includes translation logic
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const baseParams = {
      network_id: "56", // BNB Smart Chain
      token_address:
        process.env.NEXT_PUBLIC_USDT_TOKEN_ADDRESS ||
        "0x55d398326f99059fF775485246999027B3197955",
      sort: "volume",
      order: "desc",
      limit: "50",
    };

    // Fetch open, closed, and resolved markets in parallel via our API
    const [openRes, closedRes, resolvedRes] = await Promise.all([
      fetch(
        `${baseUrl}/api/markets?${new URLSearchParams({
          ...baseParams,
          state: "open",
        })}`,
        {
          next: { revalidate: 30 },
        },
      ),
      fetch(
        `${baseUrl}/api/markets?${new URLSearchParams({
          ...baseParams,
          state: "closed",
        })}`,
        {
          next: { revalidate: 30 },
        },
      ),
      fetch(
        `${baseUrl}/api/markets?${new URLSearchParams({
          ...baseParams,
          state: "resolved",
        })}`,
        {
          next: { revalidate: 30 },
        },
      ),
    ]);

    const [openData, closedData, resolvedData] = await Promise.all([
      openRes.ok ? openRes.json() : [],
      closedRes.ok ? closedRes.json() : [],
      resolvedRes.ok ? resolvedRes.json() : [],
    ]);

    // Combine all markets and filter out test markets and BNB Candles
    const allMarkets = [...openData, ...closedData, ...resolvedData].filter(
      (market) =>
        // Exclude test markets
        !market.title.toLowerCase().includes("test usd") &&
        !market.slug.includes("test-usd") &&
        // Exclude BNB Candles markets
        !market.title.toLowerCase().includes("bnb candles") &&
        !market.slug.includes("bnb-candles"),
    );

    logger.log(
      "✅ Home page loaded",
      allMarkets.length,
      "markets (open:",
      openData.length || 0,
      ", closed:",
      closedData.length || 0,
      ", resolved:",
      resolvedData.length || 0,
      ")",
    );
    return allMarkets;
  } catch (err) {
    logger.error("Error loading markets:", err);
    return [];
  }
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
