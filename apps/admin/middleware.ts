import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Admin Panel Authentication Middleware
 *
 * Protects all admin routes with password authentication.
 * Uses HTTP Basic Auth for simplicity and security.
 *
 * Required environment variables:
 * - ADMIN_USERNAME: Admin panel username
 * - ADMIN_PASSWORD: Admin panel password (use a strong password!)
 */

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export function middleware(request: NextRequest) {
  // Allow cron endpoints with proper CRON_SECRET header
  if (request.nextUrl.pathname.startsWith("/api/cron")) {
    const authHeader = request.headers.get("authorization");
    if (authHeader === `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.next();
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if password is configured
  if (!ADMIN_PASSWORD) {
    console.error("ADMIN_PASSWORD environment variable is not set!");
    return new NextResponse("Admin panel not configured. Set ADMIN_PASSWORD.", {
      status: 503,
    });
  }

  // Get the authorization header
  const authHeader = request.headers.get("authorization");

  // Check for valid Basic Auth credentials
  if (authHeader) {
    const authValue = authHeader.split(" ")[1];
    if (authValue) {
      try {
        const [user, pwd] = atob(authValue).split(":");
        if (user === ADMIN_USERNAME && pwd === ADMIN_PASSWORD) {
          return NextResponse.next();
        }
      } catch {
        // Invalid base64, fall through to auth required
      }
    }
  }

  // Request authentication
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Predik Admin Panel"',
    },
  });
}

export const config = {
  // Protect all routes except static files
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};
