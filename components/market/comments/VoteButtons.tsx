'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoteButtonsProps {
  commentId: string
  initialVotes: number
  onVote?: (commentId: string, direction: 'up' | 'down') => Promise<void>
}

export function VoteButtons({ commentId, initialVotes, onVote }: VoteButtonsProps) {
  const [votes, setVotes] = useState(initialVotes)
  const [isVoting, setIsVoting] = useState(false)

  const handleVote = async (direction: 'up' | 'down') => {
    if (isVoting) return

    setIsVoting(true)
    
    // Optimistic update
    setVotes(prev => direction === 'up' ? prev + 1 : prev - 1)

    try {
      if (onVote) {
        await onVote(commentId, direction)
      } else {
        // Default API call
        const response = await fetch(`/api/comments/${commentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ direction })
        })

        if (!response.ok) throw new Error('Vote failed')

        const data = await response.json()
        setVotes(data.votes)
      }
    } catch (error) {
      console.error('Error voting:', error)
      // Revert optimistic update
      setVotes(prev => direction === 'up' ? prev - 1 : prev + 1)
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <div className="flex items-center gap-1 text-sm">
      <button
        onClick={() => handleVote('up')}
        disabled={isVoting}
        className={cn(
          "p-1 rounded hover:bg-green-500/10 transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        aria-label="Upvote"
      >
        <ChevronUp className="h-4 w-4 text-muted-foreground hover:text-green-500" />
      </button>
      
      <span className={cn(
        "min-w-[20px] text-center font-medium",
        votes > 0 && "text-green-500",
        votes < 0 && "text-red-500"
      )}>
        {votes}
      </span>
      
      <button
        onClick={() => handleVote('down')}
        disabled={isVoting}
        className={cn(
          "p-1 rounded hover:bg-red-500/10 transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        aria-label="Downvote"
      >
        <ChevronDown className="h-4 w-4 text-muted-foreground hover:text-red-500" />
      </button>
    </div>
  )
}
