/**
 * PostHog Analytics Tracking Utilities
 *
 * Centralized tracking functions for user interactions and events.
 * All events follow PostHog naming conventions: lowercase with underscores.
 */

import { logger } from "./logger";

/**
 * Get PostHog instance if available
 */
function getPostHog() {
  if (typeof window === "undefined") return null;

  // PostHog is loaded dynamically in analytics.ts
  return (window as any).posthog || null;
}

/**
 * Check if PostHog is initialized and user has consented
 */
function canTrack(): boolean {
  const posthog = getPostHog();
  if (!posthog) {
    logger.log("📊 PostHog not available - skipping tracking");
    return false;
  }
  return true;
}

/**
 * Identify a user with PostHog
 */
export function identifyUser(
  userAddress: string,
  properties?: Record<string, any>,
) {
  if (!canTrack()) return;

  const posthog = getPostHog();
  posthog.identify(userAddress, {
    wallet_address: userAddress,
    ...properties,
  });

  logger.log("👤 User identified in PostHog:", userAddress);
}

/**
 * Reset user identity (on disconnect)
 */
export function resetUser() {
  if (!canTrack()) return;

  const posthog = getPostHog();
  posthog.reset();

  logger.log("👤 User identity reset in PostHog");
}

// ==================== MARKET EVENTS ====================

/**
 * Track when user views a market card
 */
export function trackMarketView(
  marketId: number,
  marketSlug: string,
  marketTitle: string,
) {
  if (!canTrack()) return;

  const posthog = getPostHog();
  posthog.capture("market_viewed", {
    market_id: marketId,
    market_slug: marketSlug,
    market_title: marketTitle,
  });
}

/**
 * Track when user clicks on a market card
 */
export function trackMarketClick(
  marketId: number,
  marketSlug: string,
  marketTitle: string,
  source?: string,
) {
  if (!canTrack()) return;

  const posthog = getPostHog();
  posthog.capture("market_clicked", {
    market_id: marketId,
    market_slug: marketSlug,
    market_title: marketTitle,
    source: source || "market_card",
  });

  logger.log("📊 Market clicked:", { marketId, marketSlug, source });
}

/**
 * Track when user clicks on a specific outcome
 */
export function trackOutcomeClick(
  marketId: number,
  marketSlug: string,
  outcomeId: number,
  outcomeTitle: string,
  source?: string,
) {
  if (!canTrack()) return;

  const posthog = getPostHog();
  posthog.capture("outcome_clicked", {
    market_id: marketId,
    market_slug: marketSlug,
    outcome_id: outcomeId,
    outcome_title: outcomeTitle,
    source: source || "market_card",
  });

  logger.log("📊 Outcome clicked:", { marketId, outcomeId, source });
}

/**
 * Track when user saves/unsaves a market
 */
export function trackMarketSave(
  marketId: number,
  marketSlug: string,
  isSaved: boolean,
) {
  if (!canTrack()) return;

  const posthog = getPostHog();
  posthog.capture(isSaved ? "market_saved" : "market_unsaved", {
    market_id: marketId,
    market_slug: marketSlug,
  });

  logger.log(`📊 Market ${isSaved ? "saved" : "unsaved"}:`, marketId);
}

// ==================== TRADING EVENTS ====================

/**
 * Track trade calculation (when user enters amount)
 */
export function trackTradeCalculation(
  marketId: number,
  marketSlug: string,
  outcomeId: number,
  tradeType: "buy" | "sell",
  amount: number,
  shares: number,
  priceImpact?: number,
) {
  if (!canTrack()) return;

  const posthog = getPostHog();
  posthog.capture("trade_calculated", {
    market_id: marketId,
    market_slug: marketSlug,
    outcome_id: outcomeId,
    trade_type: tradeType,
    amount_usdt: amount,
    shares_amount: shares,
    price_impact: priceImpact,
  });
}

/**
 * Track trade initiation (when user clicks trade button)
 */
export function trackTradeInitiated(
  marketId: number,
  marketSlug: string,
  outcomeId: number,
  tradeType: "buy" | "sell",
  amount: number,
) {
  if (!canTrack()) return;

  const posthog = getPostHog();
  posthog.capture("trade_initiated", {
    market_id: marketId,
    market_slug: marketSlug,
    outcome_id: outcomeId,
    trade_type: tradeType,
    amount_usdt: amount,
  });

  logger.log("📊 Trade initiated:", { marketId, outcomeId, tradeType, amount });
}

/**
 * Track successful trade
 */
export function trackTradeCompleted(
  marketId: number,
  marketSlug: string,
  outcomeId: number,
  outcomeTitle: string,
  tradeType: "buy" | "sell",
  amountUsdt: number,
  shares: number,
  txHash?: string,
) {
  if (!canTrack()) return;

  const posthog = getPostHog();
  posthog.capture("trade_completed", {
    market_id: marketId,
    market_slug: marketSlug,
    outcome_id: outcomeId,
    outcome_title: outcomeTitle,
    trade_type: tradeType,
    amount_usdt: amountUsdt,
    shares_amount: shares,
    tx_hash: txHash,
  });

  logger.log("📊 Trade completed:", {
    marketId,
    outcomeId,
    tradeType,
    amountUsdt,
    txHash,
  });
}

/**
 * Track failed trade
 */
export function trackTradeFailed(
  marketId: number,
  marketSlug: string,
  outcomeId: number,
  tradeType: "buy" | "sell",
  amount: number,
  errorMessage: string,
  errorType?: string,
) {
  if (!canTrack()) return;

  const posthog = getPostHog();
  posthog.capture("trade_failed", {
    market_id: marketId,
    market_slug: marketSlug,
    outcome_id: outcomeId,
    trade_type: tradeType,
    amount_usdt: amount,
    error_message: errorMessage,
    error_type: errorType,
  });

  logger.error("📊 Trade failed:", {
    marketId,
    outcomeId,
    tradeType,
    amount,
    errorMessage,
  });
}

// ==================== WALLET EVENTS ====================

/**
 * Track wallet connection
 */
export function trackWalletConnected(
  walletAddress: string,
  walletType?: string,
) {
  if (!canTrack()) return;

  const posthog = getPostHog();
  posthog.capture("wallet_connected", {
    wallet_address: walletAddress,
    wallet_type: walletType,
  });

  // Identify user
  identifyUser(walletAddress, { wallet_type: walletType });

  logger.log("📊 Wallet connected:", walletAddress);
}

/**
 * Track wallet disconnection
 */
export function trackWalletDisconnected() {
  if (!canTrack()) return;

  const posthog = getPostHog();
  posthog.capture("wallet_disconnected");

  // Reset user identity
  resetUser();

  logger.log("📊 Wallet disconnected");
}

/**
 * Track deposit modal opened
 */
export function trackDepositModalOpened(source?: string) {
  if (!canTrack()) return;

  const posthog = getPostHog();
  posthog.capture("deposit_modal_opened", {
    source: source || "navbar",
  });

  logger.log("📊 Deposit modal opened:", source);
}

/**
 * Track deposit tab selected
 */
export function trackDepositTabSelected(tab: "address" | "buy" | "bridge") {
  if (!canTrack()) return;

  const posthog = getPostHog();
  posthog.capture("deposit_tab_selected", {
    tab,
  });

  logger.log("📊 Deposit tab selected:", tab);
}

/**
 * Track bridge widget interaction
 */
export function trackBridgeUsed(
  fromChain?: string,
  toChain?: string,
  amount?: number,
  token?: string,
) {
  if (!canTrack()) return;

  const posthog = getPostHog();
  posthog.capture("bridge_used", {
    from_chain: fromChain,
    to_chain: toChain,
    amount: amount,
    token: token,
  });

  logger.log("📊 Bridge used:", { fromChain, toChain, amount, token });
}

/**
 * Track address copied
 */
export function trackAddressCopied(context: "deposit" | "profile" | "other") {
  if (!canTrack()) return;

  const posthog = getPostHog();
  posthog.capture("address_copied", {
    context,
  });

  logger.log("📊 Address copied:", context);
}

// ==================== NAVIGATION EVENTS ====================

/**
 * Track page view
 */
export function trackPageView(pageName: string, pageUrl?: string) {
  if (!canTrack()) return;

  const posthog = getPostHog();
  posthog.capture("$pageview", {
    page_name: pageName,
    page_url: pageUrl || window.location.href,
  });
}

/**
 * Track navigation
 */
export function trackNavigation(destination: string, source?: string) {
  if (!canTrack()) return;

  const posthog = getPostHog();
  posthog.capture("navigation", {
    destination,
    source: source || "navbar",
  });
}

// ==================== PORTFOLIO EVENTS ====================

/**
 * Track portfolio view
 */
export function trackPortfolioViewed(
  userAddress: string,
  totalPositions: number,
  totalValue?: number,
) {
  if (!canTrack()) return;

  const posthog = getPostHog();
  posthog.capture("portfolio_viewed", {
    wallet_address: userAddress,
    total_positions: totalPositions,
    total_value_usdt: totalValue,
  });
}

/**
 * Track winnings claim
 */
export function trackWinningsClaimed(
  marketId: number,
  marketSlug: string,
  amount: number,
  txHash?: string,
) {
  if (!canTrack()) return;

  const posthog = getPostHog();
  posthog.capture("winnings_claimed", {
    market_id: marketId,
    market_slug: marketSlug,
    amount_usdt: amount,
    tx_hash: txHash,
  });

  logger.log("📊 Winnings claimed:", { marketId, amount, txHash });
}

// ==================== PROPOSAL EVENTS ====================

/**
 * Track proposal creation initiated
 */
export function trackProposalCreated(proposalTitle: string, category?: string) {
  if (!canTrack()) return;

  const posthog = getPostHog();
  posthog.capture("proposal_created", {
    proposal_title: proposalTitle,
    category,
  });

  logger.log("📊 Proposal created:", proposalTitle);
}

// ==================== SOCIAL EVENTS ====================

/**
 * Track share action
 */
export function trackShare(
  shareType: "market" | "profile" | "platform",
  shareMethod: "twitter" | "telegram" | "copy" | "native",
  itemId?: number | string,
) {
  if (!canTrack()) return;

  const posthog = getPostHog();
  posthog.capture("content_shared", {
    share_type: shareType,
    share_method: shareMethod,
    item_id: itemId,
  });

  logger.log("📊 Content shared:", { shareType, shareMethod });
}

/**
 * Track comment posted
 */
export function trackCommentPosted(marketId: number, commentLength: number) {
  if (!canTrack()) return;

  const posthog = getPostHog();
  posthog.capture("comment_posted", {
    market_id: marketId,
    comment_length: commentLength,
  });
}

// ==================== ERROR TRACKING ====================

/**
 * Track errors
 */
export function trackError(
  errorType: string,
  errorMessage: string,
  context?: Record<string, any>,
) {
  if (!canTrack()) return;

  const posthog = getPostHog();
  posthog.capture("error_occurred", {
    error_type: errorType,
    error_message: errorMessage,
    ...context,
  });

  logger.error("📊 Error tracked:", { errorType, errorMessage, context });
}

// ==================== FEATURE ENGAGEMENT ====================

/**
 * Track feature usage
 */
export function trackFeatureUsed(
  featureName: string,
  properties?: Record<string, any>,
) {
  if (!canTrack()) return;

  const posthog = getPostHog();
  posthog.capture("feature_used", {
    feature_name: featureName,
    ...properties,
  });
}

/**
 * Track search
 */
export function trackSearch(
  query: string,
  resultsCount?: number,
  category?: string,
) {
  if (!canTrack()) return;

  const posthog = getPostHog();
  posthog.capture("search_performed", {
    search_query: query,
    results_count: resultsCount,
    category,
  });
}

/**
 * Track filter usage
 */
export function trackFilterApplied(
  filterType: string,
  filterValue: string | string[],
) {
  if (!canTrack()) return;

  const posthog = getPostHog();
  posthog.capture("filter_applied", {
    filter_type: filterType,
    filter_value: filterValue,
  });
}
