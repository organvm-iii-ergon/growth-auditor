import { LRUCache } from "lru-cache";

interface RateLimitOptions {
  max: number;
  windowMs: number;
  maxTrackedIPs?: number;
}

interface RateLimitResult {
  limited: boolean;
  remaining: number;
  resetMs: number;
}

/**
 * Create a rate limiter backed by an LRU cache.
 * Works in-process — suitable for single-instance deployments.
 * For multi-instance (e.g., Vercel serverless), upgrade to Redis/Upstash.
 */
export function createRateLimiter({ max, windowMs, maxTrackedIPs = 500 }: RateLimitOptions) {
  const cache = new LRUCache<string, number[]>({
    max: maxTrackedIPs,
    ttl: windowMs,
  });

  return {
    check(key: string): RateLimitResult {
      const now = Date.now();
      const windowStart = now - windowMs;

      // Get existing timestamps, filter to current window
      const timestamps = (cache.get(key) || []).filter(t => t > windowStart);

      if (timestamps.length >= max) {
        const oldestInWindow = timestamps[0];
        return {
          limited: true,
          remaining: 0,
          resetMs: oldestInWindow + windowMs - now,
        };
      }

      timestamps.push(now);
      cache.set(key, timestamps);

      return {
        limited: false,
        remaining: max - timestamps.length,
        resetMs: windowMs,
      };
    },
  };
}

/**
 * Extract client IP from request headers with proxy awareness.
 */
export function getClientIP(request: Request): string {
  // Check standard proxy headers in priority order
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs: client, proxy1, proxy2
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) return realIP.trim();

  return "127.0.0.1";
}
