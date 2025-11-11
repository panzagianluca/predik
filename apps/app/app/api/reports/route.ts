import { NextRequest, NextResponse } from "next/server";
import { db, commentReports } from "@predik/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    // Fetch reports with comment details
    const reports = await db.query.commentReports.findMany({
      where: (reports, { eq }) => eq(reports.status, status),
      with: {
        comment: true,
      },
      orderBy: (reports, { desc }) => [desc(reports.createdAt)],
      limit: 100,
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { commentId, reporterAddress, reason, details } =
      await request.json();

    // Validation
    if (!commentId || !reporterAddress || !reason) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if user already reported this comment
    const existing = await db.query.commentReports.findFirst({
      where: (reports, { and, eq }) =>
        and(
          eq(reports.commentId, commentId),
          eq(reports.reporterAddress, reporterAddress),
        ),
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ya has reportado este comentario" },
        { status: 400 },
      );
    }

    // Create report
    const [report] = await db
      .insert(commentReports)
      .values({
        commentId,
        reporterAddress,
        reason,
        details: details || null,
        status: "pending",
      })
      .returning();

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 },
    );
  }
}
