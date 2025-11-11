import { NextRequest, NextResponse } from "next/server";
import { db } from "@predik/database";
import { comments } from "@predik/database/schema";
import { eq } from "drizzle-orm";
import { logAdminAction } from "@/lib/admin-logger";

export async function POST(request: NextRequest) {
  try {
    const { commentId, reason } = await request.json();

    if (!commentId) {
      return NextResponse.json(
        { error: "Comment ID is required" },
        { status: 400 },
      );
    }

    // Get comment details before hiding
    const comment = await db.query.comments.findFirst({
      where: (comments, { eq }) => eq(comments.id, commentId),
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Hide the comment
    await db
      .update(comments)
      .set({ isHidden: true })
      .where(eq(comments.id, commentId));

    // Log admin action
    await logAdminAction({
      actionType: "hide_comment",
      resourceType: "comment",
      resourceId: commentId,
      details: {
        reason: reason || "No reason provided",
        commentContent: comment.content,
        commentAuthor: comment.userAddress,
        marketId: comment.marketId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Comment hidden successfully",
    });
  } catch (error) {
    console.error("Error hiding comment:", error);
    return NextResponse.json(
      { error: "Failed to hide comment" },
      { status: 500 },
    );
  }
}
