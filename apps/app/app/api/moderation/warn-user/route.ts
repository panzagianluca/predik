import { NextRequest, NextResponse } from "next/server";
import { db, notifications } from "@predik/database";
import { logAdminAction } from "@/lib/admin-logger";

export async function POST(request: NextRequest) {
  try {
    const { userAddress, reason } = await request.json();

    if (!userAddress || !reason) {
      return NextResponse.json(
        { error: "User address and reason are required" },
        { status: 400 },
      );
    }

    // Create warning notification
    await db.insert(notifications).values({
      type: "user",
      title: "⚠️ Advertencia de moderación",
      message: `Tu comentario fue reportado: ${reason}. Por favor, respeta las reglas de la comunidad.`,
      userAddress,
      isRead: false,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    // Log admin action
    await logAdminAction({
      actionType: "warn_user",
      resourceType: "user",
      resourceId: userAddress,
      details: {
        reason,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Warning sent to user",
    });
  } catch (error) {
    console.error("Error warning user:", error);
    return NextResponse.json({ error: "Failed to warn user" }, { status: 500 });
  }
}
