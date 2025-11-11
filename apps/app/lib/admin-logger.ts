import { db } from "@predik/database";
import { adminActions } from "@predik/database/src/schema";

/**
 * Admin Action Logger
 *
 * Phase 3 - Logs all admin operations to admin_actions table
 *
 * Logged Actions:
 * - hide_comment, delete_comment, ban_user, warn_user
 * - feature_market, unfeature_market, reorder_markets
 * - approve_proposal, reject_proposal, link_market
 * - create_announcement, delete_announcement
 *
 * NOT Logged:
 * - Page views, search queries, read operations
 */

type ActionType =
  | "hide_comment"
  | "delete_comment"
  | "ban_user"
  | "warn_user"
  | "dismiss_report"
  | "feature_market"
  | "unfeature_market"
  | "reorder_markets"
  | "approve_proposal"
  | "reject_proposal"
  | "link_market"
  | "set_myriad_id"
  | "create_announcement"
  | "delete_announcement";

type ResourceType =
  | "comment"
  | "comment_report"
  | "banned_user"
  | "market_metadata"
  | "market_proposal"
  | "notification";

interface LogAdminActionParams {
  adminEmail: string; // From Cloudflare header: cf-access-authenticated-user-email
  actionType: ActionType;
  resourceType: ResourceType;
  resourceId?: string; // UUID of affected resource
  details?: Record<string, any>; // Additional context (stored as JSON)
}

/**
 * Log an admin action to the database
 *
 * @example
 * await logAdminAction({
 *   adminEmail: 'admin@predik.io',
 *   actionType: 'hide_comment',
 *   resourceType: 'comment',
 *   resourceId: commentId,
 *   details: { reason: 'spam', marketSlug: 'boca-vs-river' }
 * });
 */
export async function logAdminAction({
  adminEmail,
  actionType,
  resourceType,
  resourceId,
  details,
}: LogAdminActionParams): Promise<void> {
  try {
    await db.insert(adminActions).values({
      adminEmail,
      actionType,
      resourceType,
      resourceId: resourceId || null,
      details: details ? JSON.stringify(details) : null,
    });

    console.log(
      `[Admin Action] ${adminEmail} performed ${actionType} on ${resourceType}${
        resourceId ? ` (${resourceId})` : ""
      }`,
    );
  } catch (error) {
    console.error("[Admin Action] Failed to log action:", error);
    // Don't throw - logging failure shouldn't break admin operations
  }
}

/**
 * Get admin email from Cloudflare Zero Trust headers
 *
 * @param headers - Request headers
 * @returns Admin email or null if not authenticated
 */
export function getAdminEmail(headers: Headers): string | null {
  // Cloudflare Zero Trust injects this header after successful auth
  const email = headers.get("cf-access-authenticated-user-email");

  if (!email) {
    console.warn("[Admin Auth] Missing Cloudflare email header");
    return null;
  }

  // Verify it's a @predik.io email (extra safety)
  if (!email.endsWith("@predik.io")) {
    console.warn("[Admin Auth] Invalid email domain:", email);
    return null;
  }

  return email;
}
