import { NextRequest, NextResponse } from 'next/server'

const MYRIAD_API_URL = process.env.NEXT_PUBLIC_MYRIAD_API_URL || 'https://api-v1.staging.myriadprotocol.com'

// In-memory cache for 1 hour
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Check cache
    const cached = cache.get(slug)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
          'X-Cache': 'HIT'
        }
      })
    }

    // Fetch market data from Myriad API
    const marketResponse = await fetch(`${MYRIAD_API_URL}/markets/${slug}`)
    if (!marketResponse.ok) {
      return NextResponse.json(
        { error: 'Market not found' },
        { status: 404 }
      )
    }

    const market = await marketResponse.json()
    const marketId = market.id
    const outcomes = market.outcomes
    const topHolders: string[] = market.top_holders || []

    console.log(`🔍 Market ${marketId}: ${market.title}`)
    console.log(`📊 Top holders from Myriad: ${topHolders.length}`)
    console.log(`📊 Top holders list:`, topHolders)

    // For now, we'll use the Myriad API's top_holders list directly
    // TODO: Query blockchain to get actual shares per outcome using polkamarkets-js SDK
    // The PredictionMarket contract requires getUserMarketShares method, not standard ERC-1155 balanceOf
    
    const responseData = {
      marketId,
      outcomes: outcomes.map((outcome: any) => ({
        id: outcome.id,
        title: outcome.title,
        price: outcome.price,
        // For now, show top holders without specific share amounts
        holders: topHolders.slice(0, 20).map((address, index) => ({
          address,
          shares: 'N/A', // TODO: Query using getUserMarketShares from polkamarkets-js
          usdValue: 'N/A' // TODO: Calculate from shares * outcome price
        }))
      })),
      cachedAt: new Date().toISOString(),
      note: 'Currently showing top holders from Myriad API. Per-outcome share amounts require server-side polkamarkets-js integration.'
    }

    // Cache the result
    cache.set(slug, {
      data: responseData,
      timestamp: Date.now()
    })

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        'X-Cache': 'MISS'
      }
    })

  } catch (error) {
    console.error('❌ Error fetching holders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch holders data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
