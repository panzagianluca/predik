# Troubleshooting Guide - Transaction Reverts

## ❌ "Transaction has been reverted by the EVM" Error

If you're seeing transaction reverts when trying to buy shares, here's how to diagnose and fix it:

### 🔍 Step 1: Check Console Logs

After clicking "Buy", open your browser console (F12) and look for these diagnostic logs:

```
🔍 Pre-buy diagnostics: {
  balance: X.XXXX,
  buyAmount: 1,
  marketState: "open",
  ...
}
```

### 💰 Step 2: Verify USDT Balance on Celo Sepolia

**Most common issue: You don't have testnet USDT!**

Check your USDT balance:
1. Go to [Celoscan Alfajores (Testnet)](https://alfajores.celoscan.io/)
2. Search for your wallet address
3. Look for USDT token balance: `0xf74B14ecbAdC9fBb283Fb3c8ae11E186856eae6f`

#### How to Get Testnet USDT:

**Option 1: Use Celo Faucet (for test tokens)**
- Visit: https://faucet.celo.org
- Connect your wallet
- Request testnet CELO first (for gas)

**Option 2: Find a USDT Faucet for Celo Sepolia**
- Search for "Celo Sepolia USDT faucet"
- Or ask in Celo Discord/community channels

**Option 3: Deploy/Mint Your Own (Advanced)**
If you have contract access, you can mint test USDT directly.

### ✅ Step 3: Verify Approval

The app automatically approves USDT spending, but check the logs:

```
💰 Token approval status: { isApproved: true, ... }
✅ Approval confirmed
```

If approval fails:
- Make sure you have CELO for gas fees
- Confirm the approval transaction in MetaMask
- Wait for it to be mined before buying

### 📊 Step 4: Check Market State

Look for this in the console:
```
🔍 Pre-buy diagnostics: {
  marketState: "open",  // Should be "open", not "closed" or "resolved"
  ...
}
```

If market is not "open":
- Choose a different market
- You can only buy shares in open markets

### 🎯 Step 5: Verify Share Calculation

```
📊 Calculated shares: {
  minShares: 0.XXX,
  isValid: true
}
```

If `minShares` is 0 or negative:
- Market might have insufficient liquidity
- Outcome price might be at extreme (0% or 100%)
- Try a different outcome or market

### 🚀 Step 6: Common Transaction Revert Causes

Based on your transaction receipt, here are the most likely issues:

1. **Insufficient USDT Balance** ⚠️ MOST LIKELY
   - You need exactly 1 USDT (or more) in your wallet
   - Check balance on Celoscan Alfajores
   - Get testnet USDT from faucet

2. **USDT Not Approved**
   - The contract can't pull USDT from your wallet
   - Wait for approval transaction to complete
   - Check console for "✅ Approval confirmed"

3. **Market Closed/Resolved**
   - Can only buy shares in "open" markets
   - Check `marketState` in console logs

4. **Slippage/Price Movement**
   - Price changed between calculation and execution
   - Try again or use a different outcome

5. **Contract/Network Issue**
   - Wrong contract address in `.env.local`
   - RPC node issues
   - Check all addresses match Myriad API

### 🔧 Quick Fix Checklist

- [ ] I have testnet CELO for gas
- [ ] I have at least 1 testnet USDT (token: `0xf74B14ecbAdC9fBb283Fb3c8ae11E186856eae6f`)
- [ ] I'm connected to Celo Sepolia (Chain ID: 44787)
- [ ] The market shows "OPEN" status
- [ ] I've checked the console logs after clicking Buy
- [ ] USDT approval transaction completed

### 📝 Detailed Error Logs

After the next Buy attempt, check your console for:
- Full error details (JSON formatted)
- Transaction hash (search on Celoscan to see exact revert reason)
- All diagnostic logs (🔍 💰 📊 🚀)

### 🆘 Still Not Working?

Share these in your issue/chat:
1. Screenshot of console logs (all the emoji diagnostic logs)
2. Your wallet address
3. USDT balance from Celoscan
4. Market ID you're trying to buy
5. Transaction hash from Celoscan

---

## Contract Addresses (Celo Sepolia)

- **Chain ID**: 44787
- **Network ID (Myriad)**: 11142220
- **Prediction Market**: `0x289E3908ECDc3c8CcceC5b6801E758549846Ab19`
- **PM Querier**: `0x49c86faa48facCBaC75920Bb0d5Dd955F8678e15`
- **USDT Token**: `0xf74B14ecbAdC9fBb283Fb3c8ae11E186856eae6f`

Verify these match in your `.env.local` file!
