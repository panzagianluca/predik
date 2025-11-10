import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { savedMarkets } from "@predik/database";
import { eq, and, desc } from "drizzle-orm";

/**
 * GET /api/saved-markets
 * Fetch all saved markets for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get("userAddress");

    if (!userAddress) {
      return NextResponse.json(
        { error: "User address required" },
        { status: 400 },
      );
    }

    const saved = await db
      .select()
      .from(savedMarkets)
      .where(eq(savedMarkets.userAddress, userAddress.toLowerCase()))
      .orderBy(desc(savedMarkets.savedAt));

    // Return array of market IDs
    const marketIds = saved.map((s) => s.marketId);

    return NextResponse.json({ marketIds });
  } catch (error) {
    console.error("Error fetching saved markets:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved markets" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/saved-markets
 * Save a market for a user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userAddress, marketId, marketSlug } = body;

    if (!userAddress || !marketId || !marketSlug) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Insert saved market (will fail silently if already exists due to unique constraint)
    await db
      .insert(savedMarkets)
      .values({
        userAddress: userAddress.toLowerCase(),
        marketId: parseInt(marketId),
        marketSlug,
      })
      .onConflictDoNothing();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving market:", error);
    return NextResponse.json(
      { error: "Failed to save market" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/saved-markets
 * Remove a saved market for a user
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get("userAddress");
    const marketId = searchParams.get("marketId");

    if (!userAddress || !marketId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await db
      .delete(savedMarkets)
      .where(
        and(
          eq(savedMarkets.userAddress, userAddress.toLowerCase()),
          eq(savedMarkets.marketId, parseInt(marketId)),
        ),
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing saved market:", error);
    return NextResponse.json(
      { error: "Failed to remove saved market" },
      { status: 500 },
    );
  }
}
