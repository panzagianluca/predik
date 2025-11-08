// Shared configuration constants

export const MYRIAD_API_URL =
  process.env.NEXT_PUBLIC_MYRIAD_API_URL || "https://api.myriad.social";
export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002";

export const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID || "97"; // BSC Testnet
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "";

// Rate limiting
export const RATE_LIMIT_COMMENTS_PER_MINUTE = 5;

// Cache times (in seconds)
export const CACHE_MARKETS = 300; // 5 minutes
export const CACHE_COMMENTS = 60; // 1 minute
export const CACHE_NOTIFICATIONS = 300; // 5 minutes
