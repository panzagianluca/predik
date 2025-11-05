import { BigInt, BigDecimal, Address } from "@graphprotocol/graph-ts";
import { MarketActionTx as MarketActionTxEvent } from "../generated/PredictionMarket/PredictionMarketV3_4";
import { User, MarketTransaction, Position, Market } from "../generated/schema";

// MarketAction enum matching your contract
enum MarketAction {
  BUY = 0,
  SELL = 1,
  ADD_LIQUIDITY = 2,
  REMOVE_LIQUIDITY = 3,
  CLAIM_WINNINGS = 4,
  CLAIM_LIQUIDITY = 5,
  CLAIM_FEES = 6,
  CLAIM_VOIDED = 7,
}

// Action labels matching your frontend
const ACTION_LABELS = [
  "Buy",
  "Sell",
  "Add Liquidity",
  "Remove Liquidity",
  "Claim Winnings",
  "Claim Liquidity",
  "Claim Fees",
  "Claim Voided",
];

function getActionLabel(action: i32): string {
  if (action >= 0 && action < ACTION_LABELS.length) {
    return ACTION_LABELS[action];
  }
  return "Unknown";
}

export function handleMarketActionTx(event: MarketActionTxEvent): void {
  // Get or create User entity
  let userId = event.params.user.toHexString();
  let user = User.load(userId);

  if (user == null) {
    user = new User(userId);
    user.address = event.params.user;
    user.totalInvested = BigInt.fromI32(0);
    user.totalWithdrawn = BigInt.fromI32(0);
    user.netPosition = BigInt.fromI32(0);
    user.transactionCount = 0;
    user.marketsTraded = [];
    user.createdAt = event.block.timestamp;
    user.updatedAt = event.block.timestamp;
  }

  // Create MarketTransaction entity
  let txId =
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let transaction = new MarketTransaction(txId);
  transaction.user = userId;
  transaction.transactionHash = event.transaction.hash;
  transaction.marketId = event.params.marketId;
  transaction.action = event.params.action;
  transaction.actionLabel = getActionLabel(event.params.action);
  transaction.outcomeId = event.params.outcomeId;
  transaction.shares = event.params.shares;
  transaction.value = event.params.value;
  transaction.timestamp = event.params.timestamp;
  transaction.blockNumber = event.block.number;
  transaction.save();

  // Update user stats
  user.transactionCount = user.transactionCount + 1;
  user.updatedAt = event.block.timestamp;

  // Track markets traded
  let marketIdStr = event.params.marketId.toString();
  let marketsTraded = user.marketsTraded;
  if (marketsTraded.indexOf(marketIdStr) == -1) {
    marketsTraded.push(marketIdStr);
    user.marketsTraded = marketsTraded;
  }

  // Update investment tracking
  let action = event.params.action;

  // Money going in: Buy, Add Liquidity
  if (action == MarketAction.BUY || action == MarketAction.ADD_LIQUIDITY) {
    user.totalInvested = user.totalInvested.plus(event.params.value);
  }

  // Money coming out: Sell, Remove Liquidity, Claims
  if (
    action == MarketAction.SELL ||
    action == MarketAction.REMOVE_LIQUIDITY ||
    action == MarketAction.CLAIM_WINNINGS ||
    action == MarketAction.CLAIM_LIQUIDITY ||
    action == MarketAction.CLAIM_FEES ||
    action == MarketAction.CLAIM_VOIDED
  ) {
    user.totalWithdrawn = user.totalWithdrawn.plus(event.params.value);
  }

  user.netPosition = user.totalWithdrawn.minus(user.totalInvested);
  user.save();

  // Update Position (only for BUY and SELL actions)
  if (action == MarketAction.BUY || action == MarketAction.SELL) {
    let positionId =
      userId +
      "-" +
      event.params.marketId.toString() +
      "-" +
      event.params.outcomeId.toString();
    let position = Position.load(positionId);

    if (position == null) {
      position = new Position(positionId);
      position.user = userId;
      position.marketId = event.params.marketId;
      position.outcomeId = event.params.outcomeId;
      position.shares = BigInt.fromI32(0);
      position.totalBought = BigInt.fromI32(0);
      position.totalSold = BigInt.fromI32(0);
      position.invested = BigInt.fromI32(0);
      position.receivedFromSells = BigInt.fromI32(0);
      position.avgEntryPrice = BigDecimal.fromString("0");
      position.isOpen = false;
      position.createdAt = event.block.timestamp;
      position.updatedAt = event.block.timestamp;
    }

    // Update position based on action
    if (action == MarketAction.BUY) {
      position.shares = position.shares.plus(event.params.shares);
      position.totalBought = position.totalBought.plus(event.params.shares);
      position.invested = position.invested.plus(event.params.value);
    } else if (action == MarketAction.SELL) {
      position.shares = position.shares.minus(event.params.shares);
      position.totalSold = position.totalSold.plus(event.params.shares);
      position.receivedFromSells = position.receivedFromSells.plus(
        event.params.value,
      );
    }

    // Calculate average entry price
    if (position.totalBought.gt(BigInt.fromI32(0))) {
      position.avgEntryPrice = position.invested
        .toBigDecimal()
        .div(position.totalBought.toBigDecimal());
    }

    position.isOpen = position.shares.gt(BigInt.fromI32(0));
    position.updatedAt = event.block.timestamp;
    position.save();
  }

  // Update Market stats
  let market = Market.load(event.params.marketId.toString());
  if (market == null) {
    market = new Market(event.params.marketId.toString());
    market.marketId = event.params.marketId;
    market.transactionCount = 0;
    market.totalVolume = BigInt.fromI32(0);
    market.uniqueTraders = [];
    market.createdAt = event.block.timestamp;
    market.updatedAt = event.block.timestamp;
  }

  market.transactionCount = market.transactionCount + 1;
  market.totalVolume = market.totalVolume.plus(event.params.value);

  // Track unique traders
  let traders = market.uniqueTraders;
  if (traders.indexOf(userId) == -1) {
    traders.push(userId);
    market.uniqueTraders = traders;
  }

  market.updatedAt = event.block.timestamp;
  market.save();
}
