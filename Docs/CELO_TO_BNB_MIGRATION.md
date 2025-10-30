# 🚀 PREDIK: CELO → BNB COMPLETE MIGRATION PLAN

**Date:** October 30, 2025  
**Migration Type:** Full Platform Infrastructure Change  
**Estimated Duration:** 5-7 Days  
**Risk Level:** 🔴 **HIGH** (Mainnet-only, no testnet validation)

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Confirmed Information](#confirmed-information)
3. [Critical Blockers](#critical-blockers)
4. [Database Audit Results](#database-audit-results)
5. [File-by-File Change Analysis](#file-by-file-change-analysis)
6. [Migration Phases](#migration-phases)
7. [Detailed Task Breakdown](#detailed-task-breakdown)
8. [Testing Strategy](#testing-strategy)
9. [Rollback Plan](#rollback-plan)
10. [Open Questions](#open-questions)

---

## 🎯 EXECUTIVE SUMMARY

### What We're Migrating

| Component | FROM (Current) | TO (Target) |
|-----------|----------------|-------------|
| **Blockchain** | Celo Sepolia (Chain ID: 11142220) | BNB Smart Chain Mainnet (Chain ID: 56) |
| **API** | Myriad V1 (staging) | Myriad V2 (production) |
| **Wallet** | Reown AppKit + RainbowKit | Dynamic Wallet Connector |
| **Token** | USDT Celo (0xf74B1...6eae6f) | USDT BNB (0x39E66...2180dbeF340) |
| **Contracts** | Celo Polkamarkets | BNB Polkamarkets (⏳ pending) |

### Why This Migration

1. **Better Liquidity**: BNB Chain has significantly higher trading volume
2. **Enhanced Features**: Myriad V2 provides embedded price charts, cross-chain questions, better performance
3. **Superior UX**: Dynamic offers email/social login + all major wallets in one solution
4. **Market Reach**: BNB users > Celo users (5-10x more potential traders)

### What Will Change

- ✅ **100% of blockchain configuration** (wagmi.ts, env vars)
- ✅ **100% of wallet connection logic** (complete provider replacement)
- ✅ **80% of API client code** (V1 → V2 breaking changes)
- ✅ **50% of component data handling** (numeric types, new fields)
- ✅ **Database**: NO changes needed (schema is chain-agnostic)
- ✅ **All trading flows** (add referral code "predik")

---

## ✅ CONFIRMED INFORMATION

### 1. BNB Chain Configuration

```typescript
Network: BNB Smart Chain Mainnet
Chain ID: 56
RPC URL: https://bsc-dataseed.binance.org/
Block Explorer: https://bscscan.com
Native Currency: BNB (18 decimals)
```

### 2. Smart Contracts (BNB Mainnet)

```typescript
USDT Token: 0x39E66eE6b2ddaf4DEfDEd3038E0162180dbeF340 ✅ CONFIRMED
PredictionMarket: ⏳ PENDING (waiting from Polkamarkets team)
PredictionMarketQuerier: ⏳ PENDING (waiting from Polkamarkets team)
```

### 3. Myriad V2 API

```typescript
Base URL: https://api-v2.myriadprotocol.com/
API Key: myr_sk_live_cwkloxyzeq47cjlorm29irdvgzynlfyxqu3bfu8g60 ✅ CONFIRMED
Network ID: 56
Authentication: x-api-key header (REQUIRED)
Rate Limit: 5 requests/second per IP/API key
```

**Breaking Changes V1 → V2:**
- ❌ `token` param → ✅ `token_address` param
- ❌ No auth → ✅ `x-api-key` header required
- ❌ String outcome IDs → ✅ Numeric outcome IDs
- ❌ String prices/volumes → ✅ Numeric prices/volumes
- ❌ Separate price chart endpoint → ✅ Embedded in market detail (`outcomes[*].price_charts`)
- ✅ NEW: `/questions` endpoints (cross-chain question aggregation)
- ✅ NEW: `/markets/:id/events` (market activity feed)
- ✅ NEW: `/markets/:id/holders` (top holders per outcome)
- ✅ NEW: `/users/:address/portfolio` (user positions with ROI/profit)

### 4. Dynamic Wallet Connector

```typescript
Environment ID: f509453f-9b66-4589-83fe-8f93f64d6850 ✅ CONFIRMED
Organization ID: 07fee5c0-772e-4554-954b-907098e416ea ✅ CONFIRMED
API Key: dyn_FbyPuaFGEscqu7fBr7fCDq0Hh5YhoX3bHGXFIr1nSqdmSicpjk49l2uy ✅ CONFIRMED
JWKS URL: https://app.dynamic.xyz/api/v0/sdk/f509453f-9b66-4589-83fe-8f93f64d6850/.well-known/jwks

Supported Wallets:
✅ MetaMask
✅ Binance Wallet
✅ Trust Wallet
✅ Email/Social Login (Google, Apple, Twitter, Discord)
✅ All Dynamic-supported wallets (~300+ options)
```

### 5. Polkamarkets SDK

```typescript
Package: polkamarkets-js ^3.2.0 (no change)
BNB Support: ✅ YES (confirmed by team)
Referral Code: "predik" ✅ MUST BE ADDED TO ALL BUY TRANSACTIONS
```

---

## 🚨 CRITICAL BLOCKERS

### BLOCKER #1: Polkamarkets Contract Addresses (BNB)

**Status:** ⏳ **WAITING**

**What We Need:**
```typescript
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=0x??? // ← REQUIRED
NEXT_PUBLIC_PREDICTION_MARKET_QUERIER=0x??? // ← REQUIRED
```

**Why It's Blocking:**
- Cannot test trading functionality
- Cannot deploy or build without these addresses
- All trading components depend on these

**Action Required:**
- Contact Polkamarkets team
- Request BNB Mainnet (Chain ID 56) contract addresses
- Verify addresses on BSCScan

**Estimated Resolution:** 1-3 days

---

### BLOCKER #2: Myriad V2 API Response Validation

**Status:** ⚠️ **NEEDS TESTING**

**What We Need to Verify:**
- Actual V2 response schemas match documentation
- All markets on BNB (network_id=56) return valid data
- Price charts format is correct
- Outcome IDs are truly numeric (not strings)

**Action Required:**
- Make test API call to `/markets?network_id=56&token_address=0x39E66eE6b2ddaf4DEfDEd3038E0162180dbeF340`
- Validate response schema
- Check if any BNB markets exist yet

**Test Command:**
```bash
curl -X GET "https://api-v2.myriadprotocol.com/markets?network_id=56&token_address=0x39E66eE6b2ddaf4DEfDEd3038E0162180dbeF340" \
  -H "x-api-key: myr_sk_live_cwkloxyzeq47cjlorm29irdvgzynlfyxqu3bfu8g60"
```

**Estimated Resolution:** 1 hour

---

### BLOCKER #3: Dynamic Wallet Testing

**Status:** ✅ **READY** (credentials confirmed, but needs integration testing)

**What We Need to Verify:**
- Dynamic SDK works with BNB Chain
- Email/social login flow
- Wallet connection UX meets requirements
- Multi-wallet switching works

**Action Required:**
- Install `@dynamic-labs/sdk-react-core`
- Create test page with Dynamic integration
- Test on BNB mainnet (no testnet available)

**Estimated Resolution:** 2-4 hours

---

## 📊 DATABASE AUDIT RESULTS

### Schema Analysis

**File:** `/Users/panza/Documents/PersonalProjects/predik/lib/db/schema.ts`

**✅ GOOD NEWS:** Database schema is **100% chain-agnostic**!

**Tables Analyzed:**

| Table | Chain-Specific Fields? | Migration Needed? |
|-------|----------------------|-------------------|
| `users` | ❌ No (only wallet addresses) | ✅ **NO** |
| `userStats` | ❌ No (generic trading stats) | ✅ **NO** |
| `comments` | ❌ No (market slugs are chain-agnostic) | ✅ **NO** |
| `commentVotes` | ❌ No | ✅ **NO** |
| `marketProposals` | ❌ No | ✅ **NO** |
| `proposalVotes` | ❌ No | ✅ **NO** |
| `notifications` | ❌ No | ✅ **NO** |

**Key Findings:**
- ✅ No `chainId` or `networkId` fields
- ✅ No transaction hashes stored
- ✅ No contract addresses in database
- ✅ `walletAddress` fields work across all EVM chains
- ✅ `marketId` is slug-based (not chain-specific blockchain ID)

**Conclusion:** **ZERO database migrations required!** 🎉

**Action Items:**
- ✅ No schema changes
- ✅ No data migration scripts
- ✅ No cleanup needed
- ⚠️ **RECOMMENDATION:** Backup database before deployment (standard practice)

---

## 📁 FILE-BY-FILE CHANGE ANALYSIS

### TIER 1: CRITICAL (Must Change - Breaks Without Updates)

#### 1. `.env.local` ✅ **COMPLETED**
**Status:** Already updated  
**Lines Changed:** 20/40 (50%)

**Changes Made:**
```diff
- NEXT_PUBLIC_CHAIN_ID=11142220
+ NEXT_PUBLIC_CHAIN_ID=56

- NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=9a559c21cee8fa03d8f34a4297e345d3
+ # Removed - Dynamic handles this

- NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=0x289E3908ECDc3c8CcceC5b6801E758549846Ab19
- NEXT_PUBLIC_PREDICTION_MARKET_QUERIER=0x49c86faa48facCBaC75920Bb0d5Dd955F8678e15
+ NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=TBD_WAITING_FOR_ADDRESS
+ NEXT_PUBLIC_PREDICTION_MARKET_QUERIER=TBD_WAITING_FOR_ADDRESS

- NEXT_PUBLIC_USDT_TOKEN_ADDRESS=0xf74B14ecbAdC9fBb283Fb3c8ae11E186856eae6f
+ NEXT_PUBLIC_USDT_TOKEN_ADDRESS=0x39E66eE6b2ddaf4DEfDEd3038E0162180dbeF340

+ NEXT_PUBLIC_POLKAMARKETS_REFERRAL_CODE=predik

- NEXT_PUBLIC_MYRIAD_API_URL=https://api-v1.staging.myriadprotocol.com
+ NEXT_PUBLIC_MYRIAD_API_URL=https://api-v2.myriadprotocol.com

+ NEXT_PUBLIC_MYRIAD_API_KEY=myr_sk_live_cwkloxyzeq47cjlorm29irdvgzynlfyxqu3bfu8g60

- NEXT_PUBLIC_MYRIAD_NETWORK_ID=11142220
+ NEXT_PUBLIC_MYRIAD_NETWORK_ID=56

+ NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=f509453f-9b66-4589-83fe-8f93f64d6850
+ NEXT_PUBLIC_DYNAMIC_ORGANIZATION_ID=07fee5c0-772e-4554-954b-907098e416ea
+ DYNAMIC_API_KEY=dyn_FbyPuaFGEscqu7fBr7fCDq0Hh5YhoX3bHGXFIr1nSqdmSicpjk49l2uy
+ DYNAMIC_JWKS_URL=https://app.dynamic.xyz/api/v0/sdk/f509453f-9b66-4589-83fe-8f93f64d6850/.well-known/jwks
```

---

#### 2. `lib/wagmi.ts` ⏳ **PENDING**
**Current:** Celo + RainbowKit connectors  
**Required:** BNB + Dynamic (NO RainbowKit)

**Current Code (62 lines):**
```typescript
import { http, createConfig } from 'wagmi'
import { celo } from 'wagmi/chains'
import { defineChain } from 'viem'
import { metaMaskWallet, coinbaseWallet, walletConnectWallet, rainbowWallet, trustWallet } from '@rainbow-me/rainbowkit/wallets'
import { connectorsForWallets } from '@rainbow-me/rainbowkit'

export const celoSepolia = defineChain({
  id: 11142220,
  name: 'Celo Sepolia',
  // ... rest of Celo config
})

const connectors = connectorsForWallets([...], { projectId })

export const config = createConfig({
  chains: [celoSepolia, celo],
  connectors,
  transports: { [celoSepolia.id]: http(...), [celo.id]: http() }
})
```

**New Code (simplified - Dynamic handles wallets):**
```typescript
import { http, createConfig } from 'wagmi'
import { bsc } from 'wagmi/chains'

export const config = createConfig({
  chains: [bsc],
  transports: {
    [bsc.id]: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://bsc-dataseed.binance.org/')
  },
  // No connectors - Dynamic SDK handles this
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
```

**Impact:** 🔴 **CRITICAL**  
**Dependencies to Remove:**
- `@rainbow-me/rainbowkit/wallets`
- `@rainbow-me/rainbowkit` (wallet connector part - keep Provider for now if needed)

**Lines Changed:** ~40 lines removed, 15 lines added  
**Complexity:** Low (simplification)

---

#### 3. `components/providers/Web3Provider.tsx` ⏳ **PENDING**
**Current:** RainbowKitProvider wrapper  
**Required:** DynamicContextProvider wrapper

**Current Code (85 lines):**
```typescript
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={...} modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

**New Code:**
```typescript
import { DynamicContextProvider, DynamicWagmiConnector } from '@dynamic-labs/sdk-react-core'
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum'

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID!,
        walletConnectors: [EthereumWalletConnectors],
        evmNetworks: [{
          blockExplorerUrls: ['https://bscscan.com'],
          chainId: 56,
          name: 'BNB Smart Chain',
          rpcUrls: ['https://bsc-dataseed.binance.org/'],
          nativeCurrency: {
            decimals: 18,
            name: 'BNB',
            symbol: 'BNB',
          },
          networkId: 56,
        }],
      }}
    >
      <DynamicWagmiConnector>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </WagmiProvider>
      </DynamicWagmiConnector>
    </DynamicContextProvider>
  )
}
```

**Impact:** 🔴 **CRITICAL**  
**Dependencies to Install:**
```bash
npm install @dynamic-labs/sdk-react-core @dynamic-labs/ethereum
```

**Dependencies to Remove:**
```bash
npm uninstall @rainbow-me/rainbowkit @reown/appkit @reown/appkit-adapter-wagmi
```

**Lines Changed:** Complete rewrite (85 → ~60 lines)  
**Complexity:** Medium

---

#### 4. `lib/myriad/api.ts` ⏳ **PENDING**
**Current:** V1 API client (no auth, `token` param)  
**Required:** V2 API client (with `x-api-key`, `token_address` param)

**Current Code (45 lines):**
```typescript
export interface FetchMarketsParams {
  state?: 'open' | 'closed' | 'resolved'
  token?: string // ❌ V1 param name
  network_id?: string
}

export async function fetchMarkets(params: FetchMarketsParams = {}) {
  const searchParams = new URLSearchParams({
    ...(params.network_id && { network_id: params.network_id }),
    ...(params.state && { state: params.state }),
    ...(params.token && { token: params.token }), // ❌ Wrong param
  })

  const response = await fetch(`/api/markets?${searchParams}`, {
    next: { revalidate: 30 },
  })
  // ... no auth header
}
```

**New Code:**
```typescript
export interface FetchMarketsParams {
  state?: 'open' | 'closed' | 'resolved'
  token_address?: string // ✅ V2 param name
  network_id?: number // ✅ Numeric in V2
  keyword?: string // ✅ NEW in V2
  topics?: string // ✅ NEW in V2
  sort?: 'volume' | 'volume_24h' | 'liquidity' | 'expires_at' | 'published_at' // ✅ NEW
  order?: 'asc' | 'desc' // ✅ NEW
  page?: number // ✅ NEW (pagination)
  limit?: number // ✅ NEW (pagination)
}

export async function fetchMarkets(params: FetchMarketsParams = {}) {
  const searchParams = new URLSearchParams()
  
  if (params.state) searchParams.set('state', params.state)
  if (params.token_address) searchParams.set('token_address', params.token_address) // ✅ Correct param
  if (params.network_id) searchParams.set('network_id', String(params.network_id))
  if (params.keyword) searchParams.set('keyword', params.keyword)
  if (params.topics) searchParams.set('topics', params.topics)
  if (params.sort) searchParams.set('sort', params.sort)
  if (params.order) searchParams.set('order', params.order)
  if (params.page) searchParams.set('page', String(params.page))
  if (params.limit) searchParams.set('limit', String(params.limit))

  const response = await fetch(`/api/markets?${searchParams}`, {
    next: { revalidate: 30 },
    // Auth handled in API route
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || `Failed to fetch markets: ${response.statusText}`)
  }

  return response.json()
}

export async function fetchMarket(slug: string) {
  // V2 supports both slug and id+network_id lookup
  const response = await fetch(`/api/markets/${slug}`, {
    next: { revalidate: 30 },
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || `Failed to fetch market: ${response.statusText}`)
  }

  return response.json()
}

// ✅ NEW V2 endpoint
export async function fetchMarketEvents(marketId: number, networkId: number) {
  const response = await fetch(`/api/markets/${marketId}/events?network_id=${networkId}`, {
    next: { revalidate: 10 }, // Faster revalidation for activity
  })
  
  if (!response.ok) throw new Error('Failed to fetch market events')
  return response.json()
}

// ✅ NEW V2 endpoint
export async function fetchMarketHolders(marketId: number, networkId: number) {
  const response = await fetch(`/api/markets/${marketId}/holders?network_id=${networkId}`, {
    next: { revalidate: 30 },
  })
  
  if (!response.ok) throw new Error('Failed to fetch holders')
  return response.json()
}

// ✅ NEW V2 endpoint
export async function fetchUserPortfolio(address: string) {
  const response = await fetch(`/api/users/${address}/portfolio`, {
    next: { revalidate: 10 },
  })
  
  if (!response.ok) throw new Error('Failed to fetch portfolio')
  return response.json()
}
```

**Impact:** 🔴 **CRITICAL**  
**Lines Changed:** 45 → 120 lines  
**Complexity:** Medium

---

#### 5. `app/api/markets/route.ts` ⏳ **PENDING**
**Current:** Proxies to V1 API with `token` param  
**Required:** Proxies to V2 API with `token_address` param + auth header

**Current Code (50 lines):**
```typescript
const MYRIAD_API_URL = process.env.NEXT_PUBLIC_MYRIAD_API_URL || 'https://api-v1.staging.myriadprotocol.com'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('token') || 'USDT' // ❌ V1 param
  const network_id = searchParams.get('network_id') || '11142220' // ❌ Celo default

  const params = new URLSearchParams({
    network_id,
    token, // ❌ Wrong param name
    ...(state && { state }),
  })

  const response = await fetch(`${MYRIAD_API_URL}/markets?${params}`, {
    headers: { 'Content-Type': 'application/json' }, // ❌ No API key
    next: { revalidate: 30 },
  })
  // ...
}
```

**New Code:**
```typescript
const MYRIAD_API_URL = process.env.NEXT_PUBLIC_MYRIAD_API_URL || 'https://api-v2.myriadprotocol.com'
const MYRIAD_API_KEY = process.env.NEXT_PUBLIC_MYRIAD_API_KEY!

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Build V2 params
    const params = new URLSearchParams()
    
    // Required params (defaults for BNB)
    params.set('network_id', searchParams.get('network_id') || '56') // ✅ BNB default
    params.set('token_address', searchParams.get('token_address') || process.env.NEXT_PUBLIC_USDT_TOKEN_ADDRESS!) // ✅ Correct param
    
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
        'x-api-key': MYRIAD_API_KEY, // ✅ Required auth
      },
      next: { revalidate: 30 },
    })

    if (!response.ok) {
      console.error('❌ Myriad V2 API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: `Myriad API error: ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    })
  } catch (error) {
    console.error('Error proxying markets request:', error)
    return NextResponse.json(
      { error: 'Failed to fetch markets from Myriad V2' },
      { status: 500 }
    )
  }
}
```

**Impact:** 🔴 **CRITICAL**  
**Lines Changed:** 50 → 70 lines  
**Complexity:** Low

---

#### 6. `types/market.ts` ⏳ **PENDING**
**Current:** V1 types (strings for prices, string outcome IDs)  
**Required:** V2 types (numbers for prices, numeric outcome IDs, new fields)

**Current Code (70 lines):**
```typescript
export interface Market {
  id: number
  slug: string
  liquidity: number // Already numeric - good!
  volume: number // Already numeric - good!
  outcomes: Outcome[]
  // ... rest
}

export interface Outcome {
  id: number // Already numeric - good!
  price: number // Already numeric - good!
  shares: number // Already numeric - good!
  price_charts?: PriceChart[] // Already has charts - good!
  // ...
}
```

**Analysis:** ✅ **ALREADY V2-COMPATIBLE!**

**Required Changes:**
```typescript
// Add new V2 fields only
export interface Market {
  // ... existing fields
  volume_24h: number // ✅ NEW in V2
  liquidityPrice: number // ✅ NEW in V2
  publishedAt: number // ✅ NEW (Unix timestamp)
  // Update outcomes structure if needed
}

export interface Outcome {
  // ... existing fields
  price_charts?: { // ✅ NEW nested structure in V2
    '24h': Array<{ timestamp: number; price: number }>
    '7d': Array<{ timestamp: number; price: number }>
    '30d': Array<{ timestamp: number; price: number }>
    'all': Array<{ timestamp: number; price: number }>
  }
}
```

**Impact:** 🟡 **MEDIUM**  
**Lines Changed:** +10 new fields  
**Complexity:** Low (additive changes only)

---

### TIER 2: HIGH PRIORITY (Trading Functionality)

#### 7. `components/market/TradingPanel.tsx` ⏳ **PENDING**
**Current:** No referral code in buy transactions  
**Required:** Add `referralAddress: 'predik'` to all buy() calls

**Current Code (Line ~160):**
```typescript
const tx = await predictionMarket.buy({
  marketId: market.id,
  outcomeId: selectedOutcome,
  value: parseFloat(amount),
  minOutcomeSharesToBuy: 0,
})
```

**New Code:**
```typescript
const tx = await predictionMarket.buy({
  marketId: market.id,
  outcomeId: selectedOutcome,
  value: parseFloat(amount),
  minOutcomeSharesToBuy: 0,
  referralAddress: process.env.NEXT_PUBLIC_POLKAMARKETS_REFERRAL_CODE || 'predik', // ✅ ADD THIS
})
```

**Impact:** 🟡 **HIGH** (revenue-generating feature)  
**Lines Changed:** 1 line per buy() call  
**Locations to Update:**
- `components/market/TradingPanel.tsx` (desktop)
- `components/market/MobileTradingModal.tsx` (mobile)

**Complexity:** Very Low

---

#### 8. `components/market/MobileTradingModal.tsx` ⏳ **PENDING**
**Same changes as TradingPanel.tsx**

**Lines Changed:** 1 line  
**Impact:** 🟡 **HIGH**

---

#### 9. `lib/polkamarkets/sdk.ts` ⏳ **PENDING**
**Current:** Basic wrapper, no referral code helper  
**Required:** Add helper function for buy with referral

**Current Code (25 lines):**
```typescript
import * as polkamarketsjs from 'polkamarkets-js'

const PM_CONTRACT = process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS || ''
const PM_QUERIER = process.env.NEXT_PUBLIC_PREDICTION_MARKET_QUERIER || ''

export function createPolkamarketsInstance(provider: any) {
  return new polkamarketsjs.Application({ web3Provider: provider })
}

export function getPredictionMarketContract(polkamarkets: any) {
  return polkamarkets.getPredictionMarketV3PlusContract({
    contractAddress: PM_CONTRACT,
    querierContractAddress: PM_QUERIER,
  })
}
```

**New Code:**
```typescript
import * as polkamarketsjs from 'polkamarkets-js'

const PM_CONTRACT = process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS || ''
const PM_QUERIER = process.env.NEXT_PUBLIC_PREDICTION_MARKET_QUERIER || ''
const REFERRAL_CODE = process.env.NEXT_PUBLIC_POLKAMARKETS_REFERRAL_CODE || 'predik' // ✅ ADD

export function createPolkamarketsInstance(provider: any) {
  return new polkamarketsjs.Application({ web3Provider: provider })
}

export function getPredictionMarketContract(polkamarkets: any) {
  return polkamarkets.getPredictionMarketV3PlusContract({
    contractAddress: PM_CONTRACT,
    querierContractAddress: PM_QUERIER,
  })
}

export function getERC20Contract(polkamarkets: any, tokenAddress: string) {
  return polkamarkets.getERC20Contract({ contractAddress: tokenAddress })
}

// ✅ NEW: Helper for buy with referral
export async function buyWithReferral(
  predictionMarket: any,
  params: {
    marketId: number
    outcomeId: number
    value: number
    minOutcomeSharesToBuy?: number
  }
) {
  return predictionMarket.buy({
    ...params,
    referralAddress: REFERRAL_CODE,
  })
}

// ✅ NEW: Helper constants
export const CONTRACTS = {
  PREDICTION_MARKET: PM_CONTRACT,
  PREDICTION_MARKET_QUERIER: PM_QUERIER,
  USDT: process.env.NEXT_PUBLIC_USDT_TOKEN_ADDRESS || '',
}

export const CONFIG = {
  REFERRAL_CODE,
  CHAIN_ID: 56,
  NETWORK_ID: 56,
}
```

**Impact:** 🟡 **MEDIUM**  
**Lines Changed:** +30 lines  
**Complexity:** Low (additive, non-breaking)

---

### TIER 3: MEDIUM PRIORITY (Component Updates)

#### 10. `components/wallet/ConnectButton.tsx` ⏳ **PENDING**
**Current:** Uses Reown AppKit hooks  
**Required:** Use Dynamic hooks

**Current Code:**
```typescript
import { useAccount, useConnect, useDisconnect } from 'wagmi'

export function ConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  
  // ... RainbowKit modal integration
}
```

**New Code:**
```typescript
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'

export function ConnectButton() {
  const { 
    user, 
    setShowAuthFlow, 
    handleLogOut,
    primaryWallet,
  } = useDynamicContext()
  
  const address = primaryWallet?.address
  const isConnected = !!user

  if (isConnected) {
    return (
      <button onClick={handleLogOut}>
        Disconnect {address?.slice(0, 6)}...{address?.slice(-4)}
      </button>
    )
  }

  return (
    <button onClick={() => setShowAuthFlow(true)}>
      Connect Wallet
    </button>
  )
}
```

**Impact:** 🟡 **MEDIUM**  
**Lines Changed:** Complete rewrite (~40 lines)  
**Complexity:** Medium

---

#### 11. `components/layout/GlobalSearch.tsx` & `MobileSearch.tsx` ⏳ **PENDING**
**Current:** Uses V1 API via `fetchMarkets()`  
**Required:** Update to use new V2 params

**Current Code:**
```typescript
const fetchMarkets = async () => {
  const data = await fetch('/api/markets?state=open&token=USDT&network_id=11142220')
  // ...
}
```

**New Code:**
```typescript
const fetchMarkets = async () => {
  const data = await fetch(`/api/markets?state=open&token_address=${process.env.NEXT_PUBLIC_USDT_TOKEN_ADDRESS}&network_id=56`)
  // OR use keyword search:
  const data = await fetch(`/api/markets?keyword=${searchQuery}&network_id=56&token_address=${process.env.NEXT_PUBLIC_USDT_TOKEN_ADDRESS}`)
  // ...
}
```

**Impact:** 🟢 **LOW**  
**Lines Changed:** 2 lines per file  
**Complexity:** Very Low

---

#### 12. `hooks/use-user-transactions.ts` ⏳ **PENDING**
**Current:** Reads from Celo chain  
**Required:** Read from BNB chain

**Current Code:**
```typescript
const PM_CONTRACT = (process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS || '') as Address

const logs = await publicClient.getLogs({
  address: PM_CONTRACT,
  event: PREDICTION_MARKET_ABI[0],
  // ... reads from current chain (Celo)
})
```

**Impact:** ✅ **AUTO-FIXED** (uses current chain from wagmi config)  
**Lines Changed:** 0 (no changes needed if wagmi.ts is updated correctly)  
**Complexity:** None

---

### TIER 4: LOW PRIORITY (Nice to Have)

#### 13. `package.json` ⏳ **PENDING**
**Dependencies to Add:**
```json
{
  "@dynamic-labs/sdk-react-core": "^3.0.0",
  "@dynamic-labs/ethereum": "^3.0.0"
}
```

**Dependencies to Remove:**
```json
{
  "@reown/appkit": "^1.8.8",
  "@reown/appkit-adapter-wagmi": "^1.8.8"
}
```

**Keep (still needed):**
```json
{
  "@rainbow-me/rainbowkit": "^2.2.8", // Remove if not using RainbowKitProvider
  "wagmi": "^2.18.0",
  "viem": "^2.38.0",
  "polkamarkets-js": "^3.2.0"
}
```

---

## 🗓️ MIGRATION PHASES

### PHASE 0: PRE-MIGRATION (2-3 Days) ⏳ **IN PROGRESS**

**Blockers to Resolve:**
- [x] Update .env.local ✅ DONE
- [ ] Get Polkamarkets BNB contract addresses ⏳ WAITING
- [ ] Test Myriad V2 API with actual call ⏳ TODO
- [ ] Verify Dynamic SDK setup ⏳ TODO
- [ ] Database backup ⏳ TODO

**Deliverables:**
- [x] Migration plan document ✅ THIS DOCUMENT
- [ ] All contract addresses confirmed
- [ ] V2 API response validated
- [ ] Dynamic test page working

---

### PHASE 1: FOUNDATION (Day 1) ⏳ **READY TO START**

**Goal:** Update core infrastructure without breaking existing functionality

**Tasks:**
1. ✅ Update `.env.local` (DONE)
2. Install new dependencies:
   ```bash
   npm install @dynamic-labs/sdk-react-core @dynamic-labs/ethereum
   ```
3. Update `lib/wagmi.ts` (BNB chain config)
4. Update `components/providers/Web3Provider.tsx` (Dynamic provider)
5. Update `lib/polkamarkets/sdk.ts` (add referral helpers)
6. Test wallet connection locally

**Success Criteria:**
- [ ] `npm run build` succeeds
- [ ] Dynamic wallet modal opens
- [ ] Can connect MetaMask to BNB mainnet
- [ ] No console errors

**Estimated Time:** 4-6 hours

---

### PHASE 2: API MIGRATION (Day 2) ⏳ **WAITING FOR PHASE 1**

**Goal:** Migrate all API clients to Myriad V2

**Tasks:**
1. Update `lib/myriad/api.ts` (V2 client)
2. Update `app/api/markets/route.ts` (V2 proxy with auth)
3. Create new API routes:
   - `app/api/markets/[id]/events/route.ts`
   - `app/api/markets/[id]/holders/route.ts`
   - `app/api/users/[address]/portfolio/route.ts`
4. Update `types/market.ts` (add new V2 fields)
5. Test API routes with Postman/curl

**Success Criteria:**
- [ ] GET `/api/markets?network_id=56` returns BNB markets
- [ ] GET `/api/markets/[slug]` returns correct data
- [ ] All new endpoints work
- [ ] No 401/403 auth errors

**Estimated Time:** 4-6 hours

---

### PHASE 3: TRADING INTEGRATION (Day 3) ⏳ **WAITING FOR POLKAMARKETS CONTRACTS**

**Goal:** Enable trading on BNB with referral code

**Tasks:**
1. Update `components/market/TradingPanel.tsx` (add referral)
2. Update `components/market/MobileTradingModal.tsx` (add referral)
3. Test approval flow with USDT BNB
4. Test buy transaction on BNB mainnet
5. Verify referral code is included in transaction

**Success Criteria:**
- [ ] Can approve USDT on BNB
- [ ] Can execute buy transaction
- [ ] Transaction includes referral code "predik"
- [ ] Shares are received correctly
- [ ] No gas estimation errors

**Estimated Time:** 6-8 hours (includes testing)

---

### PHASE 4: COMPONENT UPDATES (Day 4) ⏳ **WAITING FOR PHASE 3**

**Goal:** Update all remaining components to use V2 data

**Tasks:**
1. Update `components/wallet/ConnectButton.tsx` (Dynamic hooks)
2. Update `components/layout/GlobalSearch.tsx` (V2 search)
3. Update `components/layout/MobileSearch.tsx` (V2 search)
4. Update `components/profile/PositionsList.tsx` (if needed)
5. Update `components/profile/TransactionsList.tsx` (BNB chain)
6. Test all user-facing features

**Success Criteria:**
- [ ] Wallet connection UX works smoothly
- [ ] Search finds markets correctly
- [ ] Portfolio displays correctly
- [ ] All pages render without errors

**Estimated Time:** 4-6 hours

---

### PHASE 5: TESTING & VALIDATION (Day 5) ⏳ **WAITING FOR PHASE 4**

**Goal:** Comprehensive end-to-end testing

**Test Scenarios:**
1. **Wallet Connection:**
   - [ ] MetaMask connection
   - [ ] Binance Wallet connection
   - [ ] Trust Wallet connection
   - [ ] Email login (if enabled)
   - [ ] Disconnect/reconnect

2. **Market Browsing:**
   - [ ] Home page loads markets
   - [ ] Filters work (state, category)
   - [ ] Search finds markets
   - [ ] Market detail page loads
   - [ ] Price charts display

3. **Trading Flow:**
   - [ ] Connect wallet
   - [ ] Select market
   - [ ] Enter trade amount
   - [ ] Approve USDT
   - [ ] Execute buy
   - [ ] Transaction confirms
   - [ ] Shares appear in wallet

4. **Portfolio:**
   - [ ] View positions
   - [ ] See unrealized P&L
   - [ ] View transaction history
   - [ ] Claim winnings (if resolved markets exist)

5. **Performance:**
   - [ ] Page load times <2s
   - [ ] API responses <500ms
   - [ ] No memory leaks
   - [ ] Mobile responsiveness

**Success Criteria:**
- [ ] All test scenarios pass
- [ ] No critical bugs found
- [ ] Performance meets targets
- [ ] Ready for production

**Estimated Time:** 8-10 hours

---

### PHASE 6: DEPLOYMENT (Day 6-7) ⏳ **WAITING FOR PHASE 5**

**Pre-Deployment Checklist:**
- [ ] All tests passing
- [ ] Database backed up
- [ ] Environment variables set in Vercel
- [ ] Contract addresses confirmed
- [ ] Rollback plan ready

**Deployment Steps:**
1. Merge migration branch to `main`
2. Deploy to Vercel production
3. Verify deployment health
4. Monitor errors in Sentry (if configured)
5. Test critical paths in production
6. Monitor analytics for issues

**Post-Deployment Monitoring (48 hours):**
- [ ] Check error rates
- [ ] Monitor transaction success rate
- [ ] Track user feedback
- [ ] Verify referral code in on-chain transactions

**Rollback Triggers:**
- Transaction failure rate >10%
- API error rate >5%
- Critical bug affecting trading
- Loss of user funds

**Estimated Time:** 4-6 hours (deploy + monitor)

---

## 📝 DETAILED TASK BREAKDOWN

### Task Checklist (Copy to Your Project Management Tool)

#### INFRASTRUCTURE (9 tasks)
- [ ] **ENV-001**: Update `.env.local` with BNB config ✅ DONE
- [ ] **ENV-002**: Update `.env.example` template
- [ ] **DEPS-001**: Install Dynamic SDK packages
- [ ] **DEPS-002**: Remove Reown AppKit packages
- [ ] **WAG-001**: Update `lib/wagmi.ts` for BNB chain
- [ ] **PROV-001**: Replace Web3Provider with Dynamic
- [ ] **SDK-001**: Add referral helpers to Polkamarkets SDK
- [ ] **TEST-001**: Create Dynamic test page
- [ ] **DB-001**: Backup production database

#### API MIGRATION (8 tasks)
- [ ] **API-001**: Update `lib/myriad/api.ts` for V2
- [ ] **API-002**: Update `app/api/markets/route.ts` (add auth)
- [ ] **API-003**: Update `app/api/markets/[slug]/route.ts`
- [ ] **API-004**: Create `app/api/markets/[id]/events/route.ts`
- [ ] **API-005**: Create `app/api/markets/[id]/holders/route.ts`
- [ ] **API-006**: Create `app/api/users/[address]/portfolio/route.ts`
- [ ] **TYPE-001**: Update `types/market.ts` with V2 fields
- [ ] **TEST-002**: Test all API routes with curl/Postman

#### TRADING (5 tasks)
- [ ] **TRADE-001**: Add referral to `TradingPanel.tsx`
- [ ] **TRADE-002**: Add referral to `MobileTradingModal.tsx`
- [ ] **TRADE-003**: Test USDT approval on BNB
- [ ] **TRADE-004**: Test buy transaction on BNB
- [ ] **TRADE-005**: Verify referral code on-chain

#### COMPONENTS (6 tasks)
- [ ] **COMP-001**: Update `ConnectButton.tsx` (Dynamic hooks)
- [ ] **COMP-002**: Update `GlobalSearch.tsx` (V2 params)
- [ ] **COMP-003**: Update `MobileSearch.tsx` (V2 params)
- [ ] **COMP-004**: Update `PositionsList.tsx` (if needed)
- [ ] **COMP-005**: Update `TransactionsList.tsx` (BNB chain)
- [ ] **COMP-006**: Update `MarketsGrid.tsx` (V2 filters)

#### TESTING (12 tasks)
- [ ] **QA-001**: Wallet connection (MetaMask)
- [ ] **QA-002**: Wallet connection (Binance Wallet)
- [ ] **QA-003**: Wallet connection (Trust Wallet)
- [ ] **QA-004**: Email/social login
- [ ] **QA-005**: Market browsing
- [ ] **QA-006**: Market search
- [ ] **QA-007**: Trading flow (buy)
- [ ] **QA-008**: Trading flow (sell)
- [ ] **QA-009**: Portfolio display
- [ ] **QA-010**: Transaction history
- [ ] **QA-011**: Performance testing
- [ ] **QA-012**: Mobile responsiveness

#### DEPLOYMENT (7 tasks)
- [ ] **DEPLOY-001**: Set Vercel environment variables
- [ ] **DEPLOY-002**: Preview deployment test
- [ ] **DEPLOY-003**: Merge to main branch
- [ ] **DEPLOY-004**: Production deployment
- [ ] **DEPLOY-005**: Smoke test in production
- [ ] **DEPLOY-006**: Monitor errors (first 6 hours)
- [ ] **DEPLOY-007**: Monitor analytics (first 48 hours)

**Total Tasks:** 47

---

## 🧪 TESTING STRATEGY

### Unit Tests (Optional - Time Permitting)

```typescript
// tests/lib/myriad/api.test.ts
describe('Myriad V2 API Client', () => {
  test('fetchMarkets includes auth header', async () => {
    // Mock fetch
    const mockFetch = jest.fn()
    global.fetch = mockFetch

    await fetchMarkets({ network_id: 56 })

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('network_id=56'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'x-api-key': expect.any(String)
        })
      })
    )
  })

  test('fetchMarkets uses token_address param', async () => {
    // ...
  })
})
```

### Integration Tests (Manual)

**Test Script:** `tests/manual/migration-smoke-test.md`

```markdown
# Migration Smoke Test

## Prerequisites
- [ ] Wallet with BNB for gas
- [ ] Wallet with USDT on BNB
- [ ] MetaMask installed
- [ ] Clean browser cache

## Test Flow

### 1. Wallet Connection
- [ ] Go to http://localhost:3000
- [ ] Click "Connect Wallet"
- [ ] Dynamic modal opens
- [ ] Select MetaMask
- [ ] Approve connection
- [ ] Wallet address displays in header
- [ ] Network shows "BNB Smart Chain"

### 2. Market Browsing
- [ ] Home page shows markets
- [ ] Markets have BNB USDT prices
- [ ] Click on a market card
- [ ] Market detail page loads
- [ ] Price chart displays
- [ ] Outcomes show probabilities

### 3. Trading
- [ ] Click "Buy Yes" or "Buy No"
- [ ] Enter amount (e.g., 10 USDT)
- [ ] See share estimate
- [ ] Click "Approve USDT"
- [ ] MetaMask approval popup appears
- [ ] Approve transaction
- [ ] Wait for confirmation
- [ ] Click "Buy Shares"
- [ ] MetaMask transaction popup appears
- [ ] Confirm transaction
- [ ] Wait for confirmation
- [ ] Success message displays
- [ ] Shares appear in portfolio

### 4. Portfolio
- [ ] Click "Portfolio" in navigation
- [ ] See your positions
- [ ] See unrealized P&L
- [ ] Click on a position
- [ ] Redirects to market detail

### 5. Transaction History
- [ ] Go to Profile page
- [ ] See recent transactions
- [ ] Transactions show BNB chain
- [ ] Transaction links go to BSCScan

### 6. Disconnect
- [ ] Click wallet address
- [ ] Click "Disconnect"
- [ ] Wallet disconnects
- [ ] UI updates correctly
```

---

## 🔄 ROLLBACK PLAN

### Scenario 1: Deployment Fails

**If deployment to Vercel fails:**

1. Check build logs in Vercel dashboard
2. Common issues:
   - Missing environment variables → Add in Vercel settings
   - TypeScript errors → Fix and redeploy
   - Dependency issues → Check package.json

**Action:**
```bash
# Fix issues locally
npm run build # Verify builds
git commit -m "fix: deployment issues"
git push
# Vercel auto-deploys
```

---

### Scenario 2: Critical Bug in Production

**If users report critical bugs (trading fails, wallet crashes):**

1. **Immediate:** Revert to previous deployment in Vercel
   - Go to Vercel Dashboard → Deployments
   - Find last stable deployment
   - Click "⋯" → "Promote to Production"
   - Takes ~30 seconds

2. **Communication:**
   - Post status update: "We've detected an issue and temporarily rolled back. Investigating."
   - Disable affected features if possible

3. **Investigation:**
   - Check Sentry/console errors
   - Reproduce bug locally
   - Fix and test thoroughly
   - Redeploy when ready

---

### Scenario 3: Polkamarkets Contract Issues

**If trading transactions fail on BNB:**

**Possible Causes:**
- Wrong contract addresses
- Contract not deployed on BNB
- ABI mismatch
- Gas estimation errors

**Action:**
1. Verify contract addresses on BSCScan
2. Test contract calls with Ethers.js directly
3. Contact Polkamarkets team for support
4. If unfixable, revert to Celo (requires full rollback)

---

### Scenario 4: Myriad V2 API Down

**If V2 API returns 500 errors consistently:**

**Temporary Fix:**
- Switch API URL back to V1 in Vercel env vars
- Note: Will break V2-specific features (price charts, portfolio)

**Long-term:**
- Contact Myriad support
- Implement API fallback logic
- Cache responses more aggressively

---

### Full Rollback (Nuclear Option)

**If migration fails completely:**

1. **Revert code:**
   ```bash
   git revert <migration-commit-hash>
   git push
   ```

2. **Revert env vars in Vercel:**
   - Change back to Celo chain ID
   - Change back to V1 API URL
   - Remove V2 API key
   - Remove Dynamic credentials

3. **Verify:**
   - Test wallet connection (Celo)
   - Test market loading
   - Test trading

4. **Communicate:**
   - "We've temporarily reverted to Celo while we investigate issues with the BNB migration."

---

## ❓ OPEN QUESTIONS

### Critical Questions (Block Migration)

1. **Polkamarkets Contracts (BLOCKER)**
   - **Q:** What are the BNB Mainnet contract addresses?
   - **Who to ask:** Polkamarkets team
   - **Deadline:** Before Phase 3 (Day 3)

2. **Myriad V2 BNB Markets**
   - **Q:** Are there existing markets on BNB network_id=56?
   - **Test:** `curl -H "x-api-key: myr_sk_live_..." "https://api-v2.myriadprotocol.com/markets?network_id=56&token_address=0x39E66eE6b2ddaf4DEfDEd3038E0162180dbeF340"`
   - **If NO markets:** Can we create test markets? Or use staging?

3. **Dynamic Multi-Chain**
   - **Q:** Does Dynamic support switching between multiple EVM chains?
   - **Why:** Future-proofing if we want to support BNB + other chains
   - **Action:** Check Dynamic docs or test

### Nice-to-Have Questions

4. **RainbowKit Removal**
   - **Q:** Can we remove RainbowKit completely? Or keep as fallback?
   - **Decision:** Remove completely to reduce bundle size

5. **Myriad V2 Rate Limits**
   - **Q:** What are the exact rate limits? 5 req/sec per IP or per API key?
   - **Why:** To implement proper rate limiting/caching strategy

6. **Referral Revenue**
   - **Q:** What percentage of fees does "predik" referral code earn?
   - **Who to ask:** Polkamarkets team
   - **Why:** To track ROI and revenue projections

7. **Analytics Migration**
   - **Q:** Should we track chain migration events in PostHog?
   - **Examples:** "wallet_connected_bnb", "trade_executed_bnb"
   - **Decision:** YES - add to Phase 4

---

## 📊 SUCCESS METRICS

### Technical Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **API Response Time** | <500ms | Vercel Analytics |
| **Page Load Time** | <2s | Lighthouse |
| **Transaction Success Rate** | >95% | On-chain data |
| **Wallet Connection Success** | >90% | Dynamic dashboard |
| **Build Time** | <3 min | Vercel build logs |
| **Bundle Size** | <500KB | `npm run build` |

### Business Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Daily Active Traders** | 10+ in first week | Analytics |
| **Total Trading Volume** | $1,000+ in first week | On-chain |
| **Referral Revenue** | >0 (proof of concept) | Polkamarkets |
| **User Retention (D7)** | >40% | Analytics |

---

## 🎯 NEXT STEPS

### Immediate Actions (Today)

1. **Obtain Polkamarkets BNB Addresses**
   - Email Polkamarkets support
   - Ask in Telegram/Discord if available
   - Check Polkamarkets docs for BNB deployment

2. **Test Myriad V2 API**
   ```bash
   curl -X GET "https://api-v2.myriadprotocol.com/markets?network_id=56&token_address=0x39E66eE6b2ddaf4DEfDEd3038E0162180dbeF340" \
     -H "x-api-key: myr_sk_live_cwkloxyzeq47cjlorm29irdvgzynlfyxqu3bfu8g60"
   ```
   - Verify response format
   - Check if markets exist
   - Validate field types

3. **Backup Database**
   ```bash
   # In Neon dashboard or via CLI
   pg_dump $DATABASE_URL > predik_backup_$(date +%Y%m%d).sql
   ```

4. **Create Migration Branch**
   ```bash
   git checkout -b migration/celo-to-bnb
   ```

### Tomorrow (Start Phase 1)

1. Install Dynamic packages
2. Update wagmi.ts
3. Update Web3Provider.tsx
4. Test wallet connection
5. Commit and push changes

### This Week (Phases 2-5)

- Complete API migration
- Add referral code
- Update all components
- Comprehensive testing

### Next Week (Phase 6)

- Deploy to production
- Monitor closely
- Iterate based on feedback

---

## 📞 CONTACTS & RESOURCES

### Support Contacts

- **Polkamarkets Team:** [support@polkamarkets.com](mailto:support@polkamarkets.com)
- **Myriad Team:** [Reach out via their platform]
- **Dynamic Support:** https://docs.dynamic.xyz/support

### Documentation Links

- **Myriad V2 API:** `/Docs/myriadV2.md`
- **Dynamic SDK:** https://docs.dynamic.xyz/
- **Polkamarkets SDK:** `/Docs/Polkamarkets-SDK.md`
- **BNB Chain:** https://docs.bnbchain.org/

### Useful Tools

- **BSCScan:** https://bscscan.com/
- **BNB Testnet Faucet:** https://testnet.bnbchain.org/faucet-smart
- **Gas Tracker:** https://bscscan.com/gastracker
- **API Testing:** https://www.postman.com/

---

## ✅ FINAL PRE-FLIGHT CHECKLIST

**Before starting migration, confirm:**

- [ ] Polkamarkets BNB contract addresses obtained
- [ ] Myriad V2 API tested and working
- [ ] Dynamic credentials verified
- [ ] Database backup completed
- [ ] All team members aware of migration timeline
- [ ] Rollback plan understood
- [ ] Testing environment ready (wallets with BNB/USDT)
- [ ] Monitoring tools configured (Sentry, Vercel Analytics)

**When all boxes are checked, proceed to Phase 1.** 🚀

---

**END OF MIGRATION PLAN**

*Document Version: 1.0*  
*Last Updated: October 30, 2025*  
*Author: AI Assistant + Predik Team*
