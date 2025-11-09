// Market types based on Myriad V2 API
export interface Market {
  id: number;
  networkId: number;
  slug: string;
  title: string;
  description: string;
  titleEs?: string;
  descriptionEs?: string;
  expiresAt: string;
  state: "open" | "closed" | "resolved";
  topics: string[];
  tokenAddress: string;
  imageUrl: string;
  liquidity: number;
  volume: number;
  outcomes: Outcome[];
}

export interface Outcome {
  id: number;
  title: string;
  shares: number;
  price: number;
}
