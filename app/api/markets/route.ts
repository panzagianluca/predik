import { NextRequest, NextResponse } from 'next/server'

const MYRIAD_API_URL = process.env.NEXT_PUBLIC_MYRIAD_API_URL || 'https://api-v2.myriadprotocol.com'
const MYRIAD_API_KEY = process.env.MYRIAD_API_KEY! // SERVER-SIDE ONLY

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Build V2 params
    const params = new URLSearchParams()
    
    // Required params (defaults for BNB)
    params.set('network_id', searchParams.get('network_id') || '56') // BNB default
    params.set('token_address', searchParams.get('token_address') || process.env.NEXT_PUBLIC_USDT_TOKEN_ADDRESS!) // USDT BNB default
    
    // Optional filters
    const state = searchParams.get('state')
    const keyword = searchParams.get('keyword')
    const topics = searchParams.get('topics')
    const sort = searchParams.get('sort')
    const order = searchParams.get('order')
    const page = searchParams.get('page')
    const limit = searchParams.get('limit')
    
    if (state) params.set('state', state)
    if (keyword) params.set('keyword', keyword)
    if (topics) params.set('topics', topics)
    if (sort) params.set('sort', sort)
    if (order) params.set('order', order)
    if (page) params.set('page', page)
    if (limit) params.set('limit', limit)

    const response = await fetch(`${MYRIAD_API_URL}/markets?${params}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': MYRIAD_API_KEY, // V2 requires authentication
      },
      next: { revalidate: 30 }, // Cache for 30 seconds, then revalidate
    })

    console.log('📡 Myriad V2 API request:', `${MYRIAD_API_URL}/markets?${params}`)

    if (!response.ok) {
      console.error('❌ Myriad V2 API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: `Myriad API error: ${response.statusText}` },
        { status: response.status }
      )
    }

    const responseData = await response.json()
    
    // Myriad V2 returns paginated response with { data: [], pagination: {} }
    // Extract the markets array from the data field
    const markets = responseData.data || responseData
    const pagination = responseData.pagination
    
    console.log('✅ Myriad V2 API response:', markets.length || 0, 'markets')

    return NextResponse.json(markets, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        // Include pagination info in custom header if needed
        ...(pagination && { 'X-Pagination': JSON.stringify(pagination) }),
      },
    })
  } catch (error) {
    console.error('Error fetching markets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch markets from Myriad V2' },
      { status: 500 }
    )
  }
}
