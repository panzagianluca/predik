// Myriad V2 API client (proxied through Next.js API routes to avoid CORS)

export interface FetchMarketsParams {
  state?: 'open' | 'closed' | 'resolved'
  token_address?: string // V2 uses token_address instead of token
  network_id?: number
  keyword?: string
  topics?: string
  sort?: 'volume' | 'volume_24h' | 'liquidity' | 'expires_at' | 'published_at'
  order?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export async function fetchMarkets(params: FetchMarketsParams = {}) {
  const searchParams = new URLSearchParams()
  
  if (params.state) searchParams.set('state', params.state)
  if (params.token_address) searchParams.set('token_address', params.token_address)
  if (params.network_id) searchParams.set('network_id', String(params.network_id))
  if (params.keyword) searchParams.set('keyword', params.keyword)
  if (params.topics) searchParams.set('topics', params.topics)
  if (params.sort) searchParams.set('sort', params.sort)
  if (params.order) searchParams.set('order', params.order)
  if (params.page) searchParams.set('page', String(params.page))
  if (params.limit) searchParams.set('limit', String(params.limit))

  const url = `/api/markets?${searchParams}`
  console.log('🔍 Fetching markets (V2):', url, 'params:', params)

  const response = await fetch(url, {
    next: { revalidate: 30 }, // Cache for 30 seconds
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || `Failed to fetch markets: ${response.statusText}`)
  }

  const data = await response.json()
  console.log('✅ Received markets:', data.length || 0, 'markets')
  return data
}

export async function fetchMarket(slug: string) {
  const response = await fetch(`/api/markets/${slug}`, {
    next: { revalidate: 30 }, // Cache for 30 seconds
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || `Failed to fetch market: ${response.statusText}`)
  }

  return response.json()
}
