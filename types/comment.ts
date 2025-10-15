// Comment type for market discussions
export interface Comment {
  id: string
  marketId: string
  userAddress: string
  content: string
  gifUrl?: string | null
  parentId?: string | null
  votes: number
  createdAt: string
  updatedAt: string
  
  // Client-side computed fields
  username?: string
  avatarUrl?: string
  replies?: Comment[]
}

// API request/response types
export interface CreateCommentRequest {
  marketId: string
  userAddress: string
  content: string
  gifUrl?: string
  parentId?: string
}

export interface VoteCommentRequest {
  direction: 'up' | 'down'
}
