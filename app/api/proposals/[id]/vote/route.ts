import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { marketProposals, proposalVotes } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'

// POST /api/proposals/[id]/vote - Upvote a proposal
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { voterAddress } = body

    if (!voterAddress) {
      return NextResponse.json(
        { error: 'Voter address is required' },
        { status: 400 }
      )
    }

    // Check if user already voted
    const existingVote = await db
      .select()
      .from(proposalVotes)
      .where(
        and(
          eq(proposalVotes.proposalId, id),
          eq(proposalVotes.voterAddress, voterAddress)
        )
      )
      .limit(1)

    if (existingVote.length > 0) {
      return NextResponse.json(
        { error: 'You have already voted for this proposal' },
        { status: 400 }
      )
    }

    // Insert vote
    await db.insert(proposalVotes).values({
      proposalId: id,
      voterAddress,
    })

    // Increment upvotes count
    await db
      .update(marketProposals)
      .set({
        upvotes: sql`${marketProposals.upvotes} + 1`,
      })
      .where(eq(marketProposals.id, id))

    // Get updated proposal
    const [updatedProposal] = await db
      .select()
      .from(marketProposals)
      .where(eq(marketProposals.id, id))
      .limit(1)

    return NextResponse.json(updatedProposal)
  } catch (error) {
    console.error('Error voting on proposal:', error)
    return NextResponse.json(
      { error: 'Failed to vote on proposal' },
      { status: 500 }
    )
  }
}

// DELETE /api/proposals/[id]/vote - Remove vote (unvote)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const voterAddress = searchParams.get('voterAddress')

    if (!voterAddress) {
      return NextResponse.json(
        { error: 'Voter address is required' },
        { status: 400 }
      )
    }

    // Delete vote
    const result = await db
      .delete(proposalVotes)
      .where(
        and(
          eq(proposalVotes.proposalId, id),
          eq(proposalVotes.voterAddress, voterAddress)
        )
      )
      .returning()

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Vote not found' },
        { status: 404 }
      )
    }

    // Decrement upvotes count
    await db
      .update(marketProposals)
      .set({
        upvotes: sql`${marketProposals.upvotes} - 1`,
      })
      .where(eq(marketProposals.id, id))

    // Get updated proposal
    const [updatedProposal] = await db
      .select()
      .from(marketProposals)
      .where(eq(marketProposals.id, id))
      .limit(1)

    return NextResponse.json(updatedProposal)
  } catch (error) {
    console.error('Error removing vote:', error)
    return NextResponse.json(
      { error: 'Failed to remove vote' },
      { status: 500 }
    )
  }
}
