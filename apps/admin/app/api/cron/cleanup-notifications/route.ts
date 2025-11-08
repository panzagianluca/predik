import { NextResponse } from "next/server";
import { db, notifications } from "@predik/database";
import { and, eq, lt } from "drizzle-orm";

/**
 * Cron job to clean up old read notifications
 * Runs daily at 2 AM UTC (configured in vercel.json)
 * Deletes notifications that were marked as read more than 24 hours ago
 */
export async function GET(request: Request) {
  try {
    // Verify this is called by Vercel Cron (security check)
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Calculate 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Delete old read notifications
    const deleted = await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.is_read, true),
          lt(notifications.read_at, twentyFourHoursAgo),
        ),
      )
      .returning({ id: notifications.id });

    console.log(`🧹 Cleaned up ${deleted.length} old notifications`);

    return NextResponse.json({
      success: true,
      message: `Deleted ${deleted.length} old notifications`,
      deleted_count: deleted.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error cleaning up notifications:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
