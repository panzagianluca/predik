'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowBigUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface Proposal {
  id: string
  title: string
  category: string
  endDate: string
  source: string | null
  outcomes: string
  createdBy: string
  upvotes: number
  createdAt: string
}

interface ProposalCardProps {
  proposal: Proposal
  userAddress?: string
  userVoted?: boolean
  onVote?: (proposalId: string) => Promise<void>
}

export function ProposalCard({ proposal, userAddress, userVoted = false, onVote }: ProposalCardProps) {
  const [isVoting, setIsVoting] = useState(false)
  const [hasVoted, setHasVoted] = useState(userVoted)
  const [voteCount, setVoteCount] = useState(proposal.upvotes)

  const handleVote = async () => {
    if (!userAddress || isVoting) return

    setIsVoting(true)
    
    // Optimistic update
    const newHasVoted = !hasVoted
    const newVoteCount = hasVoted ? voteCount - 1 : voteCount + 1
    setHasVoted(newHasVoted)
    setVoteCount(newVoteCount)

    try {
      const response = await fetch(`/api/proposals/${proposal.id}/vote`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voterAddress: userAddress })
      })

      if (!response.ok) throw new Error('Vote failed')

      const data = await response.json()
      setVoteCount(data.upvotes)
      setHasVoted(data.hasVoted)
      
      if (onVote) {
        onVote(proposal.id)
      }
    } catch (error) {
      console.error('Error voting:', error)
      // Revert optimistic update
      setHasVoted(hasVoted)
      setVoteCount(voteCount)
    } finally {
      setIsVoting(false)
    }
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const outcomes = JSON.parse(proposal.outcomes)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* Upvote Button + Count */}
          <button
            onClick={handleVote}
            disabled={!userAddress || isVoting}
            className={cn(
              "flex flex-col items-center gap-1 px-2 py-1 rounded-md transition-colors min-w-[50px] h-fit",
              hasVoted
                ? "bg-electric-purple/10 text-electric-purple"
                : "bg-muted hover:bg-muted/70",
              !userAddress && "opacity-50 cursor-not-allowed"
            )}
          >
            <ArrowBigUp
              className={cn(
                "h-6 w-6",
                hasVoted && "fill-electric-purple"
              )}
            />
            <span className="text-sm font-bold">{voteCount}</span>
          </button>

          {/* Content */}
          <div className="flex-1 space-y-2">
            {/* Title + Meta info on same row */}
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-medium leading-tight flex-1">{proposal.title}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap">
                <span>por {truncateAddress(proposal.createdBy)}</span>
                <span>•</span>
                <span>
                  {formatDistanceToNow(new Date(proposal.createdAt), {
                    addSuffix: true,
                    locale: es
                  })}
                </span>
              </div>
            </div>

            {/* Category Badge + Outcomes */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                {proposal.category}
              </span>
              {outcomes.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {outcomes.join(' / ')}
                </span>
              )}
              {/* Source (if provided) */}
              {proposal.source && (
                <a
                  href={proposal.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-electric-purple hover:underline ml-auto"
                >
                  Fuente →
                </a>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
