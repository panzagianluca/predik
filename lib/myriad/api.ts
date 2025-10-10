// Myriad API client (proxied through Next.js API routes to avoid CORS)

export interface FetchMarketsParams {
  state?: 'open' | 'closed' | 'resolved'
  token?: string
  network_id?: string
}

export async function fetchMarkets(params: FetchMarketsParams = {}) {
  const searchParams = new URLSearchParams({
    ...(params.network_id && { network_id: params.network_id }),
    ...(params.state && { state: params.state }),
    ...(params.token && { token: params.token }),
  })

  const url = `/api/markets?${searchParams}`
  console.log('🔍 Fetching markets:', url, 'params:', params)

  const response = await fetch(url, {
    cache: 'no-store', // Don't cache on client side either
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
  const response = await fetch(`/api/markets/${slug}`)
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || `Failed to fetch market: ${response.statusText}`)
  }

  return response.json()
}
