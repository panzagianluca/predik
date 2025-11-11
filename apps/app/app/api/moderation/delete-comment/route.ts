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

    // Get comment details before soft-deleting
    const comment = await db.query.comments.findFirst({
      where: (comments, { eq }) => eq(comments.id, commentId),
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Soft delete: Replace content with deletion message, hide it
    await db
      .update(comments)
      .set({
        content: "[Comentario eliminado]",
        isHidden: true,
      })
      .where(eq(comments.id, commentId));

    // Log admin action
    await logAdminAction({
      actionType: "delete_comment",
      resourceType: "comment",
      resourceId: commentId,
      details: {
        reason: reason || "No reason provided",
        originalContent: comment.content,
        commentAuthor: comment.userAddress,
        marketId: comment.marketId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 },
    );
  }
}
