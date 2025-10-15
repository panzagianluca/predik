import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { comments, users } from '@/lib/db/schema'
import { eq, and, isNull, desc, inArray } from 'drizzle-orm'
import { Comment } from '@/types/comment'

// GET /api/comments?market_id=slug&limit=20&offset=0
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const marketId = searchParams.get('market_id')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!marketId) {
      return NextResponse.json(
        { error: 'market_id is required' },
        { status: 400 }
      )
    }

    // Fetch top-level comments (parent_id is null)
    const topLevelComments = await db
      .select()
      .from(comments)
      .where(and(
        eq(comments.marketId, marketId),
        isNull(comments.parentId)
      ))
      .orderBy(desc(comments.createdAt))
      .limit(limit)
      .offset(offset)

    // Fetch all replies for these comments
    const commentIds = topLevelComments.map(c => c.id)
    const replies = commentIds.length > 0
      ? await db
          .select()
          .from(comments)
          .where(inArray(comments.parentId, commentIds))
          .orderBy(desc(comments.createdAt))
      : []

    // Fetch user profiles for all comment authors
    const allUserAddresses = [
      ...topLevelComments.map(c => c.userAddress),
      ...replies.map(r => r.userAddress)
    ]
    const uniqueAddresses = [...new Set(allUserAddresses)]
    
    const userProfiles = uniqueAddresses.length > 0
      ? await db
          .select()
          .from(users)
          .where(inArray(users.walletAddress, uniqueAddresses))
      : []

    // Create a map of address -> profile
    const profileMap = new Map(
      userProfiles.map(p => [p.walletAddress, p])
    )

    // Helper to format comment with user data
    const formatComment = (comment: typeof topLevelComments[0]): Comment => {
      const profile = profileMap.get(comment.userAddress)
      const username = profile?.username || `${comment.userAddress.slice(0, 6)}...${comment.userAddress.slice(-4)}`
      const avatarUrl = profile?.customAvatar ? profile.customAvatar : undefined
      
      console.log('Formatting comment:', {
        userAddress: comment.userAddress,
        hasProfile: !!profile,
        profileData: profile,
        username,
        avatarUrl
      })
      
      return {
        id: comment.id,
        marketId: comment.marketId,
        userAddress: comment.userAddress,
        content: comment.content,
        gifUrl: comment.gifUrl,
        parentId: comment.parentId,
        votes: comment.votes,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        username,
        avatarUrl,
        replies: []
      }
    }

    // Format comments with nested replies
    const formattedComments = topLevelComments.map(comment => {
      const formatted = formatComment(comment)
      formatted.replies = replies
        .filter(r => r.parentId === comment.id)
        .map(formatComment)
      return formatted
    })

    return NextResponse.json(formattedComments)
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// POST /api/comments
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { marketId, userAddress, content, gifUrl, parentId } = body

    // Validation
    if (!marketId || !userAddress || !content) {
      return NextResponse.json(
        { error: 'marketId, userAddress, and content are required' },
        { status: 400 }
      )
    }

    if (content.length > 300) {
      return NextResponse.json(
        { error: 'Comment content must be 300 characters or less' },
        { status: 400 }
      )
    }

    // If this is a reply, verify parent exists and is not already a reply
    if (parentId) {
      const parentComment = await db
        .select()
        .from(comments)
        .where(eq(comments.id, parentId))
        .limit(1)

      if (parentComment.length === 0) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        )
      }

      if (parentComment[0].parentId !== null) {
        return NextResponse.json(
          { error: 'Cannot reply to a reply (max 1 level nesting)' },
          { status: 400 }
        )
      }
    }

    // Create comment
    const [newComment] = await db
      .insert(comments)
      .values({
        marketId,
        userAddress,
        content,
        gifUrl: gifUrl || null,
        parentId: parentId || null,
      })
      .returning()

    // Fetch user profile
    const [userProfile] = await db
      .select()
      .from(users)
      .where(eq(users.walletAddress, userAddress))
      .limit(1)

    console.log('Creating comment - user profile:', userProfile)

    const formattedComment: Comment = {
      id: newComment.id,
      marketId: newComment.marketId,
      userAddress: newComment.userAddress,
      content: newComment.content,
      gifUrl: newComment.gifUrl,
      parentId: newComment.parentId,
      votes: newComment.votes,
      createdAt: newComment.createdAt.toISOString(),
      updatedAt: newComment.updatedAt.toISOString(),
      username: userProfile?.username || `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`,
      avatarUrl: userProfile?.customAvatar ? userProfile.customAvatar : undefined,
    }

    return NextResponse.json(formattedComment, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
