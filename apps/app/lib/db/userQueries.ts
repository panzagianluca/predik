/**
 * Database Query Helpers for Multi-Wallet Users
 *
 * These helpers allow querying users by any of their linked wallets,
 * supporting Dynamic's multi-wallet feature without database schema changes.
 *
 * The database still stores one walletAddress per user (primary wallet),
 * but these helpers enable checking against multiple linked wallets.
 */

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";
import { logger } from "@/lib/logger";

/**
 * Find user by any of their linked wallet addresses
 *
 * Since we don't store linked wallets in DB yet, this currently
 * just checks the primary walletAddress. In future, if we add
 * linked_wallets column, we'll query both.
 *
 * @param addresses - Array of wallet addresses to search
 * @returns User object if found, null otherwise
 */
export async function findUserByAnyWallet(
  addresses: string[],
): Promise<typeof users.$inferSelect | null> {
  if (!addresses || addresses.length === 0) {
    logger.warn("findUserByAnyWallet called with empty addresses array");
    return null;
  }

  // Normalize all addresses to lowercase
  const normalizedAddresses = addresses.map((addr) => addr.toLowerCase());

  try {
    // For now, query by primary wallet address only
    // TODO: When we add linked_wallets column, query that too
    const user = await db.query.users.findFirst({
      where: or(
        ...normalizedAddresses.map((address) =>
          eq(users.walletAddress, address),
        ),
      ),
    });

    if (user) {
      logger.info(
        `Found user by wallet: ${user.walletAddress.slice(
          0,
          6,
        )}...${user.walletAddress.slice(-4)}`,
      );
    }

    return user || null;
  } catch (error) {
    logger.error("Error finding user by wallets:", error);
    return null;
  }
}

/**
 * Check if any of the provided addresses belongs to a user
 *
 * @param addresses - Array of wallet addresses to check
 * @returns True if any address belongs to a registered user
 */
export async function isAnyWalletRegistered(
  addresses: string[],
): Promise<boolean> {
  const user = await findUserByAnyWallet(addresses);
  return user !== null;
}

/**
 * Get user's primary wallet address
 * (for backwards compatibility with existing code)
 *
 * @param addresses - Array of linked wallet addresses
 * @returns Primary wallet address from database
 */
export async function getPrimaryWalletFromDB(
  addresses: string[],
): Promise<string | null> {
  const user = await findUserByAnyWallet(addresses);
  return user?.walletAddress || null;
}
