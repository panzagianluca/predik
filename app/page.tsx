import { MarketsGrid } from '@/components/market/MarketsGrid'
import { LogoSpinner } from '@/components/ui/logo-spinner'
import { Suspense } from 'react'

const MYRIAD_API_URL = process.env.NEXT_PUBLIC_MYRIAD_API_URL || 'https://api-v2.myriadprotocol.com'
const MYRIAD_API_KEY = process.env.MYRIAD_API_KEY!

async function getMarkets() {
  try {
    // Fetch all market states (open, closed, resolved) to enable filtering
    // Reference: Myriad V2 API requires x-api-key header (see Docs/myriadV2.md)
    
    const baseParams = {
      network_id: '56', // BNB Smart Chain
      token_address: process.env.NEXT_PUBLIC_USDT_TOKEN_ADDRESS || '0x55d398326f99059fF775485246999027B3197955',
      sort: 'volume',
      order: 'desc',
      limit: '50' // Fetch more to have enough for all filters
    }
    
    // Fetch open, closed, and resolved markets in parallel
    const [openRes, closedRes, resolvedRes] = await Promise.all([
      fetch(`${MYRIAD_API_URL}/markets?${new URLSearchParams({ ...baseParams, state: 'open' })}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': MYRIAD_API_KEY,
        },
        next: { revalidate: 30 },
      }),
      fetch(`${MYRIAD_API_URL}/markets?${new URLSearchParams({ ...baseParams, state: 'closed' })}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': MYRIAD_API_KEY,
        },
        next: { revalidate: 30 },
      }),
      fetch(`${MYRIAD_API_URL}/markets?${new URLSearchParams({ ...baseParams, state: 'resolved' })}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': MYRIAD_API_KEY,
        },
        next: { revalidate: 30 },
      }),
    ])
    
    const [openData, closedData, resolvedData] = await Promise.all([
      openRes.ok ? openRes.json() : { data: [] },
      closedRes.ok ? closedRes.json() : { data: [] },
      resolvedRes.ok ? resolvedRes.json() : { data: [] },
    ])
    
    // Combine all markets and filter out test markets
    const allMarkets = [
      ...(openData.data || []),
      ...(closedData.data || []),
      ...(resolvedData.data || []),
    ].filter(market => 
      // Exclude test markets
      !market.title.toLowerCase().includes('test usd') &&
      !market.slug.includes('test-usd')
    )
    
    console.log('✅ Home page loaded', allMarkets.length, 'markets (open:', openData.data?.length || 0, ', closed:', closedData.data?.length || 0, ', resolved:', resolvedData.data?.length || 0, ')')
    return allMarkets
  } catch (err) {
    console.error('Error loading markets:', err)
    return []
  }
}

export default async function Home() {
  const markets = await getMarkets()

  return (
    <div className="bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <h1 className="text-[30px] mb-4">
          El futuro tiene precio
        </h1>

        {/* Market Grid Section */}
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <LogoSpinner size={32} />
          </div>
        }>
          <MarketsGrid markets={markets} />
        </Suspense>
      </div>
    </div>
  )
}
