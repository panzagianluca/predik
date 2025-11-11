import { NextRequest, NextResponse } from "next/server";
import { db } from "@predik/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get("userAddress");

    if (!userAddress) {
      return NextResponse.json(
        { error: "User address is required" },
        { status: 400 },
      );
    }

    // Check if user is banned
    const ban = await db.query.bannedUsers.findFirst({
      where: (bannedUsers, { eq }) => eq(bannedUsers.userAddress, userAddress),
    });

    if (!ban) {
      return NextResponse.json({
        isBanned: false,
      });
    }

    // Check if ban has expired
    if (ban.banExpiresAt && new Date(ban.banExpiresAt) < new Date()) {
      // Ban expired
      return NextResponse.json({
        isBanned: false,
      });
    }

    // User is banned
    return NextResponse.json({
      isBanned: true,
      reason: ban.reason,
      expiresAt: ban.banExpiresAt?.toISOString() || null,
      violationCount: ban.violationCount,
    });
  } catch (error) {
    console.error("Error checking ban:", error);
    return NextResponse.json(
      { error: "Failed to check ban status" },
      { status: 500 },
    );
  }
}
