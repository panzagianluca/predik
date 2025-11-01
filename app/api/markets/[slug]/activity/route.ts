import { NextRequest, NextResponse } from "next/server";
import Web3 from "web3";
import {
  PREDICTION_MARKET_ABI,
  MarketAction,
} from "@/lib/abis/PredictionMarketV3_4";

const MYRIAD_API_URL =
  process.env.NEXT_PUBLIC_MYRIAD_API_URL || "https://api-v2.myriadprotocol.com";
const MYRIAD_API_KEY = process.env.MYRIAD_API_KEY!; // SERVER-SIDE ONLY
const PM_CONTRACT = process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS as string;
const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || "https://bsc-dataseed.binance.org/";

// In-memory cache for 5 minutes (activity updates more frequently)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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

    // Fetch market data
    const marketResponse = await fetch(`${MYRIAD_API_URL}/markets/${slug}`, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": MYRIAD_API_KEY, // V2 authentication
      },
    });
    if (!marketResponse.ok) {
      return NextResponse.json({ error: "Market not found" }, { status: 404 });
    }

    const market = await marketResponse.json();
    const marketId = market.id;
    const outcomes = market.outcomes;

    console.log(`🔍 Fetching activity for market ${marketId}...`);

    // Initialize Web3
    const web3 = new Web3(RPC_URL);
    const contract = new web3.eth.Contract(
      PREDICTION_MARKET_ABI as any,
      PM_CONTRACT,
    );

    // Get recent blocks (last ~12 hours on Celo Sepolia = ~8640 blocks at 5s per block)
    // Reduced from 24h to avoid RPC limits
    const latestBlock = Number(await web3.eth.getBlockNumber());
    const blocksToQuery = 8640; // Last 12 hours
    const fromBlock = latestBlock - blocksToQuery;
    const CHUNK_SIZE = 2000; // Query in chunks of 2000 blocks to avoid RPC limits

    console.log(
      `📊 Querying blocks ${fromBlock} to ${latestBlock} in chunks of ${CHUNK_SIZE}`,
    );

    // Query events in chunks to avoid RPC limits
    const allEvents: any[] = [];
    let currentFromBlock = fromBlock;

    while (currentFromBlock <= latestBlock) {
      const currentToBlock = Math.min(
        currentFromBlock + CHUNK_SIZE - 1,
        latestBlock,
      );

      try {
        console.log(
          `📦 Fetching chunk: blocks ${currentFromBlock} to ${currentToBlock}`,
        );

        const chunkEvents = await contract.getPastEvents("MarketActionTx", {
          fromBlock: currentFromBlock.toString(),
          toBlock: currentToBlock.toString(),
          filter: {
            marketId: [marketId],
          },
        });

        allEvents.push(...chunkEvents);
        console.log(
          `✓ Found ${chunkEvents.length} events in this chunk (total: ${allEvents.length})`,
        );
      } catch (chunkError) {
        console.error(
          `⚠️ Error fetching chunk ${currentFromBlock}-${currentToBlock}:`,
          chunkError,
        );
        // Continue with next chunk even if one fails
      }

      currentFromBlock = currentToBlock + 1;
    }

    const events = allEvents;
    console.log(
      `📝 Found ${events.length} total MarketActionTx events for market ${marketId}`,
    );

    // Process events into activities
    const activities: Array<{
      user: string;
      outcome: string;
      side: "Buy" | "Sell";
      shares: string;
      timestamp: number;
      txHash: string;
    }> = [];

    for (const event of events) {
      const { user, action, outcomeId, shares, value, timestamp } =
        event.returnValues as any;

      // Only include BUY (0) and SELL (1) actions
      if (
        Number(action) === MarketAction.BUY ||
        Number(action) === MarketAction.SELL
      ) {
        const outcomeIndex = Number(outcomeId);
        const outcomeTitle =
          outcomes[outcomeIndex]?.title || `Outcome ${outcomeIndex}`;

        // Use value (USDT spent) as the amount, formatted with 6 decimals
        const amount = (Number(value) / 1e6).toFixed(2);

        activities.push({
          user: user as string,
          outcome: outcomeTitle,
          side: Number(action) === MarketAction.BUY ? "Buy" : "Sell",
          shares: amount, // Using USDT value as shares display
          timestamp: Number(timestamp),
          txHash: event.transactionHash,
        });
      }
    }

    // Sort by timestamp descending (most recent first)
    activities.sort((a, b) => b.timestamp - a.timestamp);

    // Take last 50 activities
    const recentActivities = activities.slice(0, 50);

    console.log(
      `✅ Found ${recentActivities.length} activities for market ${marketId}`,
    );

    const responseData = {
      marketId,
      activities: recentActivities,
      cachedAt: new Date().toISOString(),
    };

    // Cache for 5 minutes
    cache.set(slug, { data: responseData, timestamp: Date.now() });

    return NextResponse.json(responseData, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("❌ Error fetching activity:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch activity",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
