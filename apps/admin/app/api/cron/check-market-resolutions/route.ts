import { NextResponse } from "next/server";
// Use app's database with correct notification schema
import { db } from "../../../../../app/lib/db";
import { notifications } from "../../../../../app/lib/db/schema";
import { eq, and } from "drizzle-orm";
import Web3 from "web3";

const MYRIAD_API_URL =
  process.env.NEXT_PUBLIC_MYRIAD_API_URL || "https://api-v2.myriadprotocol.com";
const MYRIAD_API_KEY = process.env.MYRIAD_API_KEY!;

// Smart contract ABI for reading events
const PM_ABI = [
  {
    type: "event",
    name: "Trade",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "marketId", type: "uint256", indexed: true },
      { name: "outcomeId", type: "uint256", indexed: false },
      { name: "isBuy", type: "bool", indexed: false },
      { name: "shares", type: "uint256", indexed: false },
      { name: "value", type: "uint256", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    type: "function",
    name: "getUserMarketShares",
    inputs: [
      { name: "marketId", type: "uint256" },
      { name: "user", type: "address" },
    ],
    outputs: [
      { name: "liquidity", type: "uint256" },
      { name: "outcomes", type: "uint256[]" },
    ],
    stateMutability: "view",
  },
] as const;

interface Market {
  id: number;
  slug: string;
  title: string;
  titleEs?: string;
  state: "open" | "closed" | "resolved";
  resolvedOutcomeId?: number | null;
  outcomes: Array<{ id: number; title: string }>;
}

/**
 * Cron job to check for newly closed/resolved markets and notify users with shares
 * Runs every hour (configured in vercel.json)
 *
 * Process:
 * 1. Fetch all closed + resolved markets from Myriad API
 * 2. Check which ones changed state recently (in last 2 hours)
 * 3. Find all users who have traded in those markets (from blockchain events)
 * 4. Check if users still have shares in those markets
 * 5. Create notifications for users with shares
 */
export async function GET(request: Request) {
  try {
    // Verify this is called by Vercel Cron (security check)
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🔍 Starting market resolution check...");

    // Fetch closed and resolved markets from Myriad API
    const baseParams = {
      network_id: "56", // BNB Smart Chain
      limit: "100",
    };

    const [closedRes, resolvedRes] = await Promise.all([
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
        },
      ),
    ]);

    const [closedData, resolvedData] = await Promise.all([
      closedRes.ok ? closedRes.json() : { data: [] },
      resolvedRes.ok ? resolvedRes.json() : { data: [] },
    ]);

    const closedMarkets: Market[] = closedData.data || [];
    const resolvedMarkets: Market[] = resolvedData.data || [];

    console.log(
      `📊 Found ${closedMarkets.length} closed markets, ${resolvedMarkets.length} resolved markets`,
    );

    // Check which markets changed state recently (in last 2 hours)
    // We check expiresAt for closed markets and use a 2-hour window
    const twoHoursAgo = new Date();
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

    const recentlyChanged = [...closedMarkets, ...resolvedMarkets].filter(
      (market: any) => {
        if (market.state === "resolved") {
          // For resolved markets, we assume they just resolved (no timestamp in API)
          // We'll check if notification already exists to avoid duplicates
          return true;
        }
        // For closed markets, check if they closed in last 2 hours
        const expiresAt = new Date(market.expiresAt);
        return expiresAt >= twoHoursAgo;
      },
    );

    console.log(
      `⏰ ${recentlyChanged.length} markets changed state in last 2 hours`,
    );

    if (recentlyChanged.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No recently changed markets",
        markets_checked: closedMarkets.length + resolvedMarkets.length,
        notifications_created: 0,
      });
    }

    // Initialize Web3 for reading blockchain data
    const web3 = new Web3(
      process.env.NEXT_PUBLIC_RPC_URL || "https://bsc-dataseed.binance.org/",
    );
    const contract = new web3.eth.Contract(
      PM_ABI as any,
      process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS!,
    );

    let totalNotifications = 0;

    // Process each recently changed market
    for (const market of recentlyChanged) {
      try {
        console.log(
          `🔔 Processing market #${market.id}: "${market.title}" (${market.state})`,
        );

        // Get all users who have traded in this market from blockchain events
        const fromBlock = 0; // Start from contract deployment
        const toBlock = "latest";

        const tradeEvents = await contract.getPastEvents("Trade", {
          filter: { marketId: market.id },
          fromBlock,
          toBlock,
        });

        // Get unique user addresses
        const uniqueUsers = [
          ...new Set(
            tradeEvents.map((event: any) =>
              event.returnValues.user.toLowerCase(),
            ),
          ),
        ];

        console.log(
          `👥 Found ${uniqueUsers.length} unique users who traded in market #${market.id}`,
        );

        // Check each user's current shares
        for (const userAddress of uniqueUsers) {
          try {
            // Check if notification already exists for this user + market
            const existingNotification = await db.query.notifications.findFirst(
              {
                where: (notifs, { and, eq }) =>
                  and(
                    eq(notifs.userAddress, userAddress as string),
                    eq(notifs.marketSlug, market.slug),
                    eq(notifs.type, "market_resolved"),
                  ),
              },
            );

            if (existingNotification) {
              console.log(
                `⏭️  Notification already exists for ${userAddress} on market #${market.id}`,
              );
              continue;
            }

            // Get user's current shares
            const result = await contract.methods
              .getUserMarketShares(market.id, userAddress)
              .call();

            const outcomeShares = (result.outcomes as string[]).map((s) =>
              BigInt(s),
            );
            const hasShares = outcomeShares.some(
              (shares) => shares > BigInt(0),
            );

            if (hasShares) {
              // Find which outcome(s) the user has shares in
              const userOutcomes = market.outcomes
                .filter((_, index) => outcomeShares[index] > BigInt(0))
                .map((outcome) => outcome.title)
                .join(", ");

              // Create notification
              const notificationType =
                market.state === "resolved"
                  ? "market_resolved"
                  : "market_closed";
              const title =
                market.state === "resolved"
                  ? "Mercado Resuelto"
                  : "Mercado Cerrado";
              const message =
                market.state === "resolved"
                  ? `El mercado "${
                      market.titleEs || market.title
                    }" ha sido resuelto. Tienes acciones en: ${userOutcomes}`
                  : `El mercado "${
                      market.titleEs || market.title
                    }" ha cerrado. Tienes acciones en: ${userOutcomes}`;

              await db.insert(notifications).values({
                userAddress: userAddress as string,
                type: notificationType as "market_resolved",
                title,
                message,
                link: `/markets/${market.slug}`,
                marketSlug: market.slug,
                isRead: false,
              });

              totalNotifications++;
              console.log(
                `✅ Created notification for ${userAddress} on market #${market.id}`,
              );
            }
          } catch (userError) {
            console.error(
              `Error processing user ${userAddress} for market #${market.id}:`,
              userError,
            );
            // Continue with next user
          }
        }
      } catch (marketError) {
        console.error(`Error processing market #${market.id}:`, marketError);
        // Continue with next market
      }
    }

    console.log(`✅ Created ${totalNotifications} notifications total`);

    return NextResponse.json({
      success: true,
      message: `Checked ${recentlyChanged.length} markets, created ${totalNotifications} notifications`,
      markets_checked: recentlyChanged.length,
      notifications_created: totalNotifications,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error checking market resolutions:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
