import { NextRequest, NextResponse } from 'next/server'

const MYRIAD_API_URL = process.env.NEXT_PUBLIC_MYRIAD_API_URL || 'https://api-v2.myriadprotocol.com'
const MYRIAD_API_KEY = process.env.MYRIAD_API_KEY!
const NETWORK_ID = '56' // BNB
const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_USDT_TOKEN_ADDRESS!

// Cache for 1 hour
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || 'month'
    const cacheKey = `holders-v2-${timeframe}`

    // Check cache
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
          'X-Cache': 'HIT'
        }
      })
    }

    console.log(`💎 Fetching holders ranking from Myriad V2 API`)

    // Step 1: Get all open markets
    const marketsResponse = await fetch(
      `${MYRIAD_API_URL}/markets?network_id=${NETWORK_ID}&token_address=${TOKEN_ADDRESS}&state=open&limit=100`,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': MYRIAD_API_KEY,
        },
      }
    )

    if (!marketsResponse.ok) {
      throw new Error(`Myriad API error: ${marketsResponse.statusText}`)
    }

    const marketsData = await marketsResponse.json()
    const markets = marketsData.data || []

    console.log(`📊 Fetching holders from ${markets.length} markets`)

    // Step 2: Aggregate holders across all markets
    const userShares: Record<string, number> = {}

    // Fetch holders for each market (limit to avoid rate limits)
    const holdersPromises = markets.slice(0, 20).map(async (market: any) => {
      try {
        const holdersResponse = await fetch(
          `${MYRIAD_API_URL}/markets/${market.id}/holders?network_id=${NETWORK_ID}&limit=50`,
          {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': MYRIAD_API_KEY,
            },
          }
        )

        if (!holdersResponse.ok) return null

        const holdersData = await holdersResponse.json()
        return holdersData
      } catch (err) {
        console.error(`Error fetching holders for market ${market.id}:`, err)
        return null
      }
    })

    const holdersResults = await Promise.all(holdersPromises)

    // Aggregate shares per user
    for (const holdersData of holdersResults) {
      if (!holdersData) continue

      for (const outcome of holdersData.data || []) {
        for (const holder of outcome.holders || []) {
          const address = holder.user.toLowerCase()
          const shares = Number(holder.shares) || 0
          userShares[address] = (userShares[address] || 0) + shares
        }
      }
    }

    // Convert to ranked list
    const rankedHolders = Object.entries(userShares)
      .map(([address, shares]) => ({
        address,
        value: shares.toFixed(2)
      }))
      .sort((a, b) => parseFloat(b.value) - parseFloat(a.value))
      .slice(0, 10) // Top 10
      .map((user, index) => ({
        ...user,
        rank: index + 1
      }))

    console.log(`💎 Top ${rankedHolders.length} holders calculated`)

    // Cache the result
    cache.set(cacheKey, { data: rankedHolders, timestamp: Date.now() })

    return NextResponse.json(rankedHolders, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        'X-Cache': 'MISS'
      }
    })

  } catch (error) {
    console.error('❌ Error fetching holders ranking:', error)
    return NextResponse.json(
      { error: 'Failed to fetch holders ranking', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
