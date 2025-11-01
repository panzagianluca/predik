// Shared in-memory cache for holders data so multiple API routes can reuse it.
// Kept intentionally simple: Map<slug, { data, timestamp }>
export const holdersCache = new Map<string, { data: any; timestamp: number }>();
export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function getCachedHolders(slug: string) {
  const cached = holdersCache.get(slug);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION)
    return cached.data;
  return null;
}

export function setCachedHolders(slug: string, data: any) {
  holdersCache.set(slug, { data, timestamp: Date.now() });
}
