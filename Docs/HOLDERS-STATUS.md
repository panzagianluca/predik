# Holders Tab - Current Status & Next Steps

## Current Implementation

### ✅ What's Working:
1. **Holders API endpoint** (`/api/markets/[slug]/holders`)
   - Fetches market data from Myriad API
   - Retrieves `top_holders` list (up to 20 addresses)
   - Implements 1-hour in-memory caching
   - Returns holders for both outcomes

2. **HoldersList Component**
   - Two-column layout (outcome 1 | outcome 2)
   - Displays holder addresses (truncated with copy functionality)
   - Loading state with LogoSpinner (S size)
   - Cache timestamp display

### ❌ Current Limitations:
1. **No per-outcome share amounts** - Shows "N/A" for shares and USD values
2. **Same holders shown for both outcomes** - Using general top_holders list, not outcome-specific
3. **No blockchain integration** - Only using Myriad API data

## Why Blockchain Integration Failed

### The Problem:
The PredictionMarket contract does **NOT** expose standard ERC-1155 `balanceOf` function.

### Evidence:
```
Error: The contract function "balanceOf" returned no data ("0x")
Contract: 0x289E3908ECDc3c8CcceC5b6801E758549846Ab19
```

### Root Cause:
Polkamarkets uses a custom contract that requires the `getUserMarketShares` method instead:

```javascript
const userMarketShares = await pm.getContract().methods.getUserMarketShares(marketId, address).call()
// Returns: [liquidityShares, outcomeShares[]]
```

This method is only available through the **polkamarkets-js SDK**, which:
- Requires Web3 provider (window.ethereum)
- Is designed for client-side use
- Cannot easily be used in Next.js API routes (server-side)

## Solutions for Real Blockchain Data

### Option A: Use Polkamarkets SDK in API Route (Complex)
**Pros:**
- Most accurate data directly from blockchain
- No dependency on external APIs

**Cons:**
- polkamarkets-js not designed for server-side
- Need to setup Web3 provider with private key (security risk)
- Complex to implement and maintain
- Slow (many RPC calls)

### Option B: Store in Database (Recommended)
**Pros:**
- Fast queries
- Historical tracking
- Reliable
- Can index from blockchain events offline

**Implementation:**
1. Create `market_holders` table in PostgreSQL:
```sql
CREATE TABLE market_holders (
  id SERIAL PRIMARY KEY,
  market_id INTEGER NOT NULL,
  outcome_id INTEGER NOT NULL,
  holder_address VARCHAR(42) NOT NULL,
  shares NUMERIC(18, 6) NOT NULL,
  usd_value NUMERIC(18, 2),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(market_id, outcome_id, holder_address)
);
```

2. Create a background job/cron that:
   - Runs every hour
   - Fetches holder balances using polkamarkets-js
   - Updates database
   
3. API route reads from database instead of blockchain

### Option C: Use Myriad's Indexed Data (Current + Best for MVP)
**Pros:**
- Already working
- Fast
- Reliable
- Myriad maintains the indexing

**Cons:**
- Cannot get per-outcome breakdown
- Dependent on Myriad API

**Current Status:** ✅ **This is what we're using now**

## Database Storage Question

### Do we NEED to store in DB?
**For MVP (current state):** NO
- In-memory cache works fine for 1-hour refresh
- Myriad API is reliable
- No historical tracking needed yet

**For Production:** YES, if you want:
- Historical holder tracking
- Per-outcome share amounts
- Faster load times
- Independence from Myriad API updates
- Analytics on holder behavior

### Recommended DB Schema (if implementing):
```typescript
// drizzle/schema.ts
export const marketHolders = pgTable('market_holders', {
  id: serial('id').primaryKey(),
  marketId: integer('market_id').notNull(),
  outcomeId: integer('outcome_id').notNull(),
  holderAddress: varchar('holder_address', { length: 42 }).notNull(),
  shares: numeric('shares', { precision: 18, scale: 6 }).notNull(),
  usdValue: numeric('usd_value', { precision: 18, scale: 2 }),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  uniqueHolder: uniqueIndex('unique_market_outcome_holder')
    .on(table.marketId, table.outcomeId, table.holderAddress),
  marketIdx: index('market_id_idx').on(table.marketId),
}))
```

## Next Steps (Priority Order)

### 1. Immediate (Current State is Acceptable):
- ✅ Display top holders from Myriad API
- ✅ Show addresses with copy functionality
- ⏸️ Accept "N/A" for share amounts (temporary)

### 2. Short-term (If you need per-outcome data):
- Create background job using polkamarkets-js SDK
- Store results in PostgreSQL
- Update API to read from DB

### 3. Long-term (Production):
- Implement Graph Protocol indexer for Polkamarkets events
- Real-time holder updates
- Historical charts
- Holder analytics

## Testing the Current Implementation

```bash
# Test the endpoint
curl "http://localhost:3000/api/markets/YOUR-MARKET-SLUG/holders" | jq

# Check if your address is in top_holders
curl "https://api-v1.staging.myriadprotocol.com/markets/YOUR-MARKET-SLUG" | jq '.top_holders'
```

## Summary

**Current Status:** Holders tab is WORKING but shows limited data (addresses only, no share amounts).

**Why:** Polkamarkets contract doesn't expose standard ERC-1155 balanceOf, requires custom SDK integration.

**Should we store in DB?** Not required for MVP, but YES for production if you want:
- Per-outcome share tracking
- Historical data
- Faster performance
- Analytics

**Recommended Next Step:** Keep current implementation for MVP, plan database + background job for v2.
