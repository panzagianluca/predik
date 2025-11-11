import { NextRequest, NextResponse } from "next/server";
import { db } from "@predik/database";

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
