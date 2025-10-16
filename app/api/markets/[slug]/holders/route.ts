import { NextRequest, NextResponse } from 'next/server'
import { getHolderShares } from '@/lib/getHolderShares'

const MYRIAD_API_URL = process.env.NEXT_PUBLIC_MYRIAD_API_URL || 'https://api-v1.staging.myriadprotocol.com'

// In-memory cache for 12 hours (twice daily refresh)
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 12 * 60 * 60 * 1000 // 12 hours

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
          'Cache-Control': 'public, s-maxage=43200, stale-while-revalidate=86400',
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

    console.log(`🔍 Fetching REAL blockchain shares for market ${marketId}...`)
    console.log(`📊 Top holders: ${topHolders.length}`)

    // For each outcome, get real shares from blockchain
    const holdersByOutcome: Record<number, Array<{
      address: string
      shares: string
    }>> = {}

    for (let outcomeIndex = 0; outcomeIndex < outcomes.length; outcomeIndex++) {
      const holders: Array<{ address: string; shares: bigint }> = []
      
      console.log(`\n🔎 Processing outcome ${outcomeIndex}: ${outcomes[outcomeIndex].title}`)
      
      // Query blockchain for each holder's shares
      for (const holderAddress of topHolders) {
        try {
          const { outcomeShares } = await getHolderShares(marketId, holderAddress)
          const shares = outcomeShares[outcomeIndex]
          
          if (shares > BigInt(0)) {
            holders.push({
              address: holderAddress,
              shares
            })
            console.log(`  ✅ ${holderAddress}: ${shares} raw shares`)
          }
        } catch (err) {
          console.error(`  ❌ Error for ${holderAddress}:`, err)
        }
      }

      // Sort by shares descending
      holders.sort((a, b) => Number(b.shares - a.shares))
      const top20 = holders.slice(0, 20)

      // Format shares (6 decimals for USDT)
      holdersByOutcome[outcomeIndex] = top20.map(holder => ({
        address: holder.address,
        shares: (Number(holder.shares) / 1e6).toFixed(2)
      }))

      console.log(`  📊 Found ${top20.length} holders with shares for outcome ${outcomeIndex}`)
    }

    const responseData = {
      marketId,
      outcomes: outcomes.map((outcome: any, index: number) => ({
        id: outcome.id,
        title: outcome.title,
        price: outcome.price,
        holders: holdersByOutcome[index] || []
      })),
      cachedAt: new Date().toISOString(),
      note: 'Real blockchain data - cached for 12 hours'
    }

    // Cache for 12 hours
    cache.set(slug, { data: responseData, timestamp: Date.now() })

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, s-maxage=43200, stale-while-revalidate=86400',
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
