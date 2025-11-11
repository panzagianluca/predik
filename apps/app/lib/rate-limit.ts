import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Upstash Redis Rate Limiting
 *
 * Phase 3 - Serverless rate limiting for spam prevention
 *
 * Limits:
 * - Comments: 5 per minute (prevent spam)
 * - Proposals: 3 per hour (prevent flooding)
 * - Votes: NO LIMIT (unique constraint prevents duplicates)
 *
 * Setup:
 * 1. Create Upstash Redis database at https://upstash.com
 * 2. Add credentials to .env.local:
 *    UPSTASH_REDIS_REST_URL=your_url_here
 *    UPSTASH_REDIS_REST_TOKEN=your_token_here
 */

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "placeholder_url",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "placeholder_token",
});

/**
 * Comment rate limiter
 * 5 requests per minute per user
 */
export const commentRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "@predik/comments",
});

/**
 * Proposal rate limiter
 * 3 requests per hour per user
 */
export const proposalRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"),
  analytics: true,
  prefix: "@predik/proposals",
});

/**
 * Check rate limit and return appropriate response
 *
 * @param identifier - User wallet address or IP
 * @param limiter - Which rate limiter to use
 * @returns { success: boolean, limit, remaining, reset }
 */
export async function checkRateLimit(
  identifier: string,
  limiter: typeof commentRateLimit | typeof proposalRateLimit,
) {
  try {
    const { success, limit, remaining, reset } = await limiter.limit(
      identifier,
    );

    return {
      success,
      limit,
      remaining,
      reset,
    };
  } catch (error) {
    console.error("[Rate Limit] Error checking rate limit:", error);
    // On error, allow the request (fail open)
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
    };
  }
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: {
  limit: number;
  remaining: number;
  reset: number;
}) {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": new Date(result.reset).toISOString(),
  };
}
