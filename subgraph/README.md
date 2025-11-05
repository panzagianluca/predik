# Predik Subgraph

This subgraph indexes user transactions and positions from the Predik prediction market contract on BNB Smart Chain.

## 📋 Prerequisites

1. Node.js v18+ installed
2. The Graph CLI installed globally
3. A The Graph Studio account (free at https://thegraph.com/studio/)

## 🚀 Setup Instructions

### Step 1: Install The Graph CLI

```bash
npm install -g @graphprotocol/graph-cli
```

### Step 2: Install Dependencies

```bash
cd subgraph
npm install
```

### Step 3: Create a Subgraph in The Graph Studio

1. Go to https://thegraph.com/studio/
2. Connect your wallet
3. Click "Create a Subgraph"
4. Name it: `predik-bsc` (or any name you prefer)
5. Select network: **BNB Smart Chain**
6. Copy the deploy key shown on the page

### Step 4: Authenticate

```bash
graph auth --studio <YOUR_DEPLOY_KEY>
```

### Step 5: Find Contract Deployment Block

Before deploying, we need to set the correct `startBlock` in `subgraph.yaml` to speed up initial indexing:

```bash
# Replace with your contract address
EXPLORER="https://bscscan.com/address/0x39E66eE6b2ddaf4DEfDEd3038E0162180dbeF340"
```

Visit the BSCScan page and find the "Contract Creation" transaction. Note the block number and update `subgraph.yaml`:

```yaml
source:
  startBlock: <BLOCK_NUMBER_HERE>
```

### Step 6: Generate TypeScript Types

```bash
npm run codegen
```

This generates TypeScript bindings from your schema and ABI.

### Step 7: Build the Subgraph

```bash
npm run build
```

### Step 8: Deploy to The Graph Studio

```bash
npm run deploy
```

Or manually:

```bash
graph deploy --studio predik-bsc
```

### Step 9: Wait for Sync

- The subgraph will start syncing from the `startBlock`
- Initial sync takes ~30-60 minutes depending on how many transactions exist
- Monitor progress in The Graph Studio dashboard
- Once synced, you'll get a GraphQL endpoint URL

### Step 10: Update Frontend Environment Variable

Add to your `.env.local`:

```bash
NEXT_PUBLIC_SUBGRAPH_URL=https://api.studio.thegraph.com/query/<YOUR_ID>/predik-bsc/version/latest
```

You can find this URL in The Graph Studio after deployment.

## 🔍 GraphQL Queries

### Get User Transactions

```graphql
query GetUserTransactions($userAddress: String!) {
  user(id: $userAddress) {
    address
    totalInvested
    totalWithdrawn
    netPosition
    transactionCount
    marketsTraded
    transactions(orderBy: timestamp, orderDirection: desc) {
      id
      transactionHash
      marketId
      action
      actionLabel
      outcomeId
      shares
      value
      timestamp
      blockNumber
    }
  }
}
```

### Get User Open Positions

```graphql
query GetUserPositions($userAddress: String!) {
  positions(where: { user: $userAddress, isOpen: true }) {
    marketId
    outcomeId
    shares
    totalBought
    totalSold
    invested
    receivedFromSells
    avgEntryPrice
  }
}
```

### Get All User Data (Combined)

```graphql
query GetUserData($userAddress: String!) {
  user(id: $userAddress) {
    address
    totalInvested
    totalWithdrawn
    netPosition
    transactionCount
    marketsTraded
    transactions(orderBy: timestamp, orderDirection: desc, first: 100) {
      id
      transactionHash
      marketId
      action
      actionLabel
      outcomeId
      shares
      value
      timestamp
      blockNumber
    }
    positions(where: { isOpen: true }) {
      marketId
      outcomeId
      shares
      totalBought
      totalSold
      invested
      receivedFromSells
      avgEntryPrice
    }
  }
}
```

## 📊 Schema Overview

### User

- Aggregated stats per wallet address
- Total invested/withdrawn amounts
- List of markets traded
- Relation to all transactions and positions

### MarketTransaction

- Individual transaction records
- Maps 1:1 with blockchain events
- Includes all event parameters

### Position

- Tracks shares in each market/outcome
- Auto-calculates average entry price
- Marked as `isOpen` if shares > 0

### Market

- Aggregated stats per market
- Total volume and transaction count
- List of unique traders

## 🔧 Development Commands

```bash
# Generate types from schema
npm run codegen

# Build the subgraph
npm run build

# Deploy to The Graph Studio
npm run deploy

# Local development (requires Docker)
npm run create-local
npm run deploy-local
```

## 📝 Updating the Subgraph

When you make changes to the schema or mappings:

1. Update `schema.graphql` or `src/mapping.ts`
2. Run `npm run codegen` to regenerate types
3. Run `npm run build` to compile
4. Run `npm run deploy` to deploy new version
5. The Graph Studio will show version history

## 🐛 Troubleshooting

### "Failed to deploy to network"

- Check that you authenticated with the correct deploy key
- Verify network is set to `bsc` in `subgraph.yaml`

### "Sync is very slow"

- Set `startBlock` to contract deployment block
- Contact The Graph support if issues persist

### "No data showing after deployment"

- Wait for initial sync to complete (check Studio dashboard)
- Verify contract address is correct in `subgraph.yaml`
- Check that contract has emitted events

### "Type generation failed"

- Delete `generated/` folder and run `npm run codegen` again
- Ensure `abis/PredictionMarketV3_4.json` is valid JSON

## 📚 Resources

- [The Graph Docs](https://thegraph.com/docs/)
- [AssemblyScript Docs](https://www.assemblyscript.org/)
- [The Graph Studio](https://thegraph.com/studio/)
- [BNB Smart Chain Explorer](https://bscscan.com/)
