import { MarketsGrid } from '@/components/market/MarketsGrid'
import { LogoSpinner } from '@/components/ui/logo-spinner'
import { Suspense } from 'react'

async function getMarkets() {
  try {
    // Use the Next.js API route which includes authentication
    // Reference: Myriad V2 API requires x-api-key header (see Docs/myriadV2.md)
    const params = new URLSearchParams({
      network_id: '56', // BNB Smart Chain
      token_address: process.env.NEXT_PUBLIC_USDT_TOKEN_ADDRESS || '0x55d398326f99059fF775485246999027B3197955',
      state: 'open', // Only show open markets on home page
      sort: 'volume',
      order: 'desc',
      limit: '20'
    })
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/markets?${params}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 30 }, // Cache for 30 seconds
    })
    
    if (!response.ok) {
      console.error('Failed to fetch markets:', response.status, response.statusText)
      return []
    }
    
    const data = await response.json()
    
    // Ensure we always return an array
    const markets = Array.isArray(data) ? data : (data.data || [])
    console.log('✅ Home page loaded', markets.length, 'markets')
    return markets
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
