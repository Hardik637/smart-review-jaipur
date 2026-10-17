import { NextRequest, NextResponse } from "next/server";

interface RateLimitConfig {
  limit: number; // Max requests
  windowSeconds: number; // In seconds
}

// In-process fallback cache for local dev / single instance
const localRateLimitMap = new Map<string, { count: number; resetAt: number }>();

/**
 * Distributed Serverless-Safe Rate Limiter
 * Supports Upstash Redis / Vercel KV when configured via environment variables,
 * with standard headers and Retry-After response helpers.
 */
export async function checkRateLimit(
  req: NextRequest | Request,
  endpoint: string,
  config: RateLimitConfig = { limit: 10, windowSeconds: 60 }
): Promise<{ success: boolean; limit: number; remaining: number; resetAt: number }> {
  // Extract client IP address
  const forwardedFor = (req as any).headers?.get("x-forwarded-for") || "";
  const realIp = (req as any).headers?.get("x-real-ip") || "";
  const ip = forwardedFor.split(",")[0].trim() || realIp || "127.0.0.1";

  const key = `ratelimit:${endpoint}:${ip}`;
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  // 1. If Upstash Redis is configured in production, use distributed atomic pipeline
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      const response = await fetch(`${upstashUrl}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${upstashToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", key],
          ["EXPIRE", key, config.windowSeconds],
        ]),
      });

      if (response.ok) {
        const data = await response.json();
        const currentCount = (data[0] && data[0].result) || 1;
        const remaining = Math.max(0, config.limit - currentCount);
        const resetAt = Math.floor((now + windowMs) / 1000);

        return {
          success: currentCount <= config.limit,
          limit: config.limit,
          remaining,
          resetAt,
        };
      }
    } catch (redisErr) {
      console.warn("Distributed rate limit check warning:", redisErr);
    }
  }

  // 2. Resilient local fallback (with automatic expired entry pruning)
  if (localRateLimitMap.size > 2000) {
    localRateLimitMap.forEach((v, k) => {
      if (now > v.resetAt) {
        localRateLimitMap.delete(k);
      }
    });
  }

  const record = localRateLimitMap.get(key);
  if (!record || now > record.resetAt) {
    localRateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetAt: Math.floor((now + windowMs) / 1000),
    };
  }

  record.count += 1;
  const remaining = Math.max(0, config.limit - record.count);
  return {
    success: record.count <= config.limit,
    limit: config.limit,
    remaining,
    resetAt: Math.floor(record.resetAt / 1000),
  };
}

/**
 * Standard 429 Too Many Requests Response
 */
export function rateLimitExceededResponse(limit: number, resetAt: number): NextResponse {
  const retryAfterSeconds = Math.max(1, resetAt - Math.floor(Date.now() / 1000));
  return NextResponse.json(
    {
      success: false,
      error: "Too many requests. Please slow down and try again shortly.",
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(resetAt),
      },
    }
  );
}
