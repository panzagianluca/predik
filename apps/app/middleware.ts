import { NextRequest, NextResponse } from "next/server";

/**
 * CORS + Rate Limiting Middleware
 *
 * Phase 3 - Applies to all /api/* routes
 *
 * CORS:
 * - Allows: predik.io, staging.predik.io, all Vercel preview deployments
 * - Methods: GET, POST, PATCH, DELETE
 * - Credentials: Enabled (for Dynamic wallet auth)
 *
 * Rate Limiting:
 * - POST /api/comments: 5 per minute
 * - POST /api/proposals: 3 per hour
 * - Other endpoints: No limit (votes have unique constraints)
 */

const ALLOWED_ORIGINS = [
  "https://predik.io",
  "https://staging.predik.io",
  "https://app.predik.io",
  /^https:\/\/.*-predik.*\.vercel\.app$/,
] as const;

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");
  const response = NextResponse.next();

  // CORS: Check if origin is allowed
  const isAllowedOrigin = ALLOWED_ORIGINS.some((allowed) => {
    if (typeof allowed === "string") {
      return origin === allowed;
    }
    return allowed.test(origin || "");
  });

  if (isAllowedOrigin && origin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PATCH, DELETE, OPTIONS",
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Dynamic-Token",
    );
  }

  // Handle preflight
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: response.headers,
    });
  }

  // Rate limiting applied in route handlers (see lib/rate-limit.ts)
  return response;
}

export const config = {
  matcher: "/api/:path*",
};
