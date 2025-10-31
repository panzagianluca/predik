// Market types based on Myriad V2 API
export interface Market {
  id: number;
  networkId: number;
  slug: string;
  title: string;
  description: string;
  createdAt?: string;
  expiresAt: string;
  publishedAt: string;
  fees: number;
  state: "open" | "closed" | "resolved";
  topics: string[];
  resolutionSource?: string;
  resolutionTitle?: string;
  tokenAddress: string;
  imageUrl: string;
  bannerUrl?: string;
  liquidity: number;
  liquidityPrice: number;
  volume: number;
  volume24h?: number;
  shares: number;
  resolvedOutcomeId?: number | null;
  voided?: boolean;
  users?: number; // V2 doesn't provide this
  outcomes: Outcome[];
  relatedMarkets?: Market[];

  // Legacy fields for backward compatibility
  network_id?: number;
  expires_at?: string;
  image_url?: string;
  volume_eur?: number;
  liquidity_eur?: number;
}

export interface Token {
  name: string;
  address: string;
  symbol: string;
  decimals: number;
  wrapped: boolean;
}

export interface Outcome {
  id: number;
  marketId?: number;
  title: string;
  shares: number;
  sharesHeld?: number;
  price: number;
  closingPrice?: number | null;
  priceChange24h?: number;
  imageUrl?: string | null;
  priceCharts?: PriceChart[];

  // Legacy fields
  market_id?: number;
  shares_held?: number;
  closing_price?: number | null;
  price_change_24h?: number;
  image_url?: string | null;
  price_charts?: PriceChart[];
}

export interface PriceChart {
  timeframe: string;
  prices: PricePoint[];
}

export interface PricePoint {
  value: number;
  timestamp: number;
  date: string;
}
