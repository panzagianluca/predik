import { NextRequest, NextResponse } from "next/server";
import { db, commentReports } from "@predik/database";
import { eq } from "drizzle-orm";
import { logAdminAction } from "@/lib/admin-logger";

export async function POST(request: NextRequest) {
  try {
    const { reportId, reason } = await request.json();

    if (!reportId) {
      return NextResponse.json(
        { error: "Report ID is required" },
        { status: 400 },
      );
    }

    // Get report details
    const report = await db.query.commentReports.findFirst({
      where: (reports, { eq }) => eq(reports.id, reportId),
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Update report status to dismissed
    await db
      .update(commentReports)
      .set({
        status: "dismissed",
        reviewedAt: new Date(),
      })
      .where(eq(commentReports.id, reportId));

    // Log admin action
    await logAdminAction({
      actionType: "dismiss_report",
      resourceType: "report",
      resourceId: reportId,
      details: {
        reason: reason || "No reason provided",
        commentId: report.commentId,
        reportReason: report.reason,
        reporterAddress: report.reporterAddress,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Report dismissed successfully",
    });
  } catch (error) {
    console.error("Error dismissing report:", error);
    return NextResponse.json(
      { error: "Failed to dismiss report" },
      { status: 500 },
    );
  }
}
