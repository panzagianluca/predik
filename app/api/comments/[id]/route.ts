import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { comments } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// DELETE /api/comments/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get('user_address')

    if (!userAddress) {
      return NextResponse.json(
        { error: 'user_address is required' },
        { status: 400 }
      )
    }

    // Fetch comment to verify ownership
    const [comment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, id))
      .limit(1)

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    if (comment.userAddress !== userAddress) {
      return NextResponse.json(
        { error: 'You can only delete your own comments' },
        { status: 403 }
      )
    }

    // Delete comment (and all replies if it's a top-level comment)
    await db.delete(comments).where(eq(comments.id, id))

    // Also delete all replies to this comment
    await db.delete(comments).where(eq(comments.parentId, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}

// PATCH /api/comments/[id] - Vote on a comment
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { direction } = body

    if (!direction || !['up', 'down'].includes(direction)) {
      return NextResponse.json(
        { error: 'direction must be "up" or "down"' },
        { status: 400 }
      )
    }

    // Fetch current comment
    const [comment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, id))
      .limit(1)

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Update votes
    const newVotes = direction === 'up' ? comment.votes + 1 : comment.votes - 1

    const [updatedComment] = await db
      .update(comments)
      .set({ 
        votes: newVotes,
        updatedAt: new Date()
      })
      .where(eq(comments.id, id))
      .returning()

    return NextResponse.json({
      id: updatedComment.id,
      votes: updatedComment.votes
    })
  } catch (error) {
    console.error('Error voting on comment:', error)
    return NextResponse.json(
      { error: 'Failed to vote on comment' },
      { status: 500 }
    )
  }
}
