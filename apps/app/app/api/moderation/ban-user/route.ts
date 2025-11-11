import { NextRequest, NextResponse } from "next/server";
import { db, bannedUsers } from "@predik/database";
import { eq } from "drizzle-orm";
import { logAdminAction } from "@/lib/admin-logger";

export async function POST(request: NextRequest) {
  try {
    const { userAddress, reason, duration } = await request.json();

    if (!userAddress || !reason || !duration) {
      return NextResponse.json(
        { error: "User address, reason, and duration are required" },
        { status: 400 },
      );
    }

    // Calculate ban expiration
    let banExpiresAt: Date | null = null;

    if (duration !== "permanent") {
      const now = new Date();
      const days = parseInt(duration); // "1", "7", or "30"
      banExpiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    }

    // Check if user is already banned
    const existingBan = await db.query.bannedUsers.findFirst({
      where: (bannedUsers, { eq }) => eq(bannedUsers.userAddress, userAddress),
    });

    if (existingBan) {
      // Update existing ban
      await db
        .update(bannedUsers)
        .set({
          reason,
          violationCount: existingBan.violationCount + 1,
          banExpiresAt,
          bannedBy: "gianluca@predik.io",
        })
        .where(eq(bannedUsers.userAddress, userAddress));
    } else {
      // Create new ban
      await db.insert(bannedUsers).values({
        userAddress,
        reason,
        violationCount: 1,
        banExpiresAt,
        bannedBy: "gianluca@predik.io",
      });
    }

    // Log admin action
    await logAdminAction({
      actionType: "ban_user",
      resourceType: "user",
      resourceId: userAddress,
      details: {
        reason,
        duration: duration === "permanent" ? "permanent" : `${duration} days`,
        banExpiresAt: banExpiresAt?.toISOString() || "permanent",
        violationCount: existingBan ? existingBan.violationCount + 1 : 1,
      },
    });

    return NextResponse.json({
      success: true,
      message: `User banned for ${
        duration === "permanent" ? "permanently" : duration + " days"
      }`,
    });
  } catch (error) {
    console.error("Error banning user:", error);
    return NextResponse.json({ error: "Failed to ban user" }, { status: 500 });
  }
}
