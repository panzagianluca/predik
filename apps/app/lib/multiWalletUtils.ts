/**
 * Multi-Wallet Utility Functions
 *
 * Helpers for working with Dynamic's multi-wallet feature.
 * Users can link multiple wallets (MetaMask, Google, X, Email) to one account.
 *
 * Dynamic handles the linking via their SDK and Dashboard.
 * We keep our existing database structure - no schema changes needed.
 *
 * @see https://docs.dynamic.xyz/wallets/advanced-wallets/multi-wallet
 */

import { logger } from "./logger";

/**
 * Get all wallet addresses from Dynamic user wallets array
 *
 * @param wallets - Array of Wallet objects from useUserWallets() hook
 * @returns Array of lowercase wallet addresses
 *
 * @example
 * ```tsx
 * import { useUserWallets } from '@dynamic-labs/sdk-react-core';
 * import { getAllWalletAddresses } from '@/lib/multiWalletUtils';
 *
 * const wallets = useUserWallets();
 * const addresses = getAllWalletAddresses(wallets);
 * // ['0x123...', '0x456...', '0x789...']
 * ```
 */
export function getAllWalletAddresses(
  wallets: Array<{ address: string }>,
): string[] {
  if (!wallets || wallets.length === 0) return [];

  return wallets
    .map((wallet) => wallet.address.toLowerCase())
    .filter((address) => address && address.startsWith("0x"));
}

/**
 * Check if a wallet address belongs to the current user
 * (useful for authorization checks)
 *
 * @param targetAddress - Wallet address to check
 * @param userWallets - Array of user's linked wallets
 * @returns True if target address is in user's wallets
 *
 * @example
 * ```tsx
 * const isOwner = isUserWallet('0x123...', userWallets);
 * if (!isOwner) {
 *   throw new Error('Unauthorized');
 * }
 * ```
 */
export function isUserWallet(
  targetAddress: string,
  userWallets: Array<{ address: string }>,
): boolean {
  const normalizedTarget = targetAddress.toLowerCase();
  const userAddresses = getAllWalletAddresses(userWallets);

  return userAddresses.includes(normalizedTarget);
}

/**
 * Get primary wallet from user wallets array
 * Primary wallet is the one marked as authenticated
 *
 * @param wallets - Array of Wallet objects from useUserWallets()
 * @returns Primary wallet or first wallet if none marked as primary
 *
 * @example
 * ```tsx
 * const primaryWallet = getPrimaryWallet(userWallets);
 * console.log(primaryWallet.address); // '0x123...'
 * ```
 */
export function getPrimaryWallet(
  wallets: Array<{ address: string; isAuthenticated?: boolean }>,
): { address: string; isAuthenticated?: boolean } | null {
  if (!wallets || wallets.length === 0) return null;

  // Find authenticated wallet (primary)
  const primary = wallets.find((wallet) => wallet.isAuthenticated);
  if (primary) return primary;

  // Fallback to first wallet
  return wallets[0];
}

/**
 * Format wallet addresses for logging (privacy-safe)
 *
 * @param addresses - Array of wallet addresses
 * @returns Formatted string for logging
 *
 * @example
 * ```tsx
 * logger.info(`User wallets: ${formatWalletsForLog(addresses)}`);
 * // Output: "User wallets: 0x123...abc, 0x456...def"
 * ```
 */
export function formatWalletsForLog(addresses: string[]): string {
  return addresses
    .map((addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`)
    .join(", ");
}

/**
 * Client-side: Get all linked wallet addresses from Dynamic context
 * Server-side: Parse from request headers or body
 *
 * This is a helper to abstract the difference between client/server usage
 */
export interface UserWalletsData {
  primaryAddress: string;
  allAddresses: string[];
  walletCount: number;
}

/**
 * Parse user wallets data for consistent format
 *
 * @param wallets - Wallets from useUserWallets() or API response
 * @returns Normalized wallet data
 */
export function parseUserWallets(
  wallets: Array<{ address: string; isAuthenticated?: boolean }>,
): UserWalletsData | null {
  if (!wallets || wallets.length === 0) return null;

  const primary = getPrimaryWallet(wallets);
  const allAddresses = getAllWalletAddresses(wallets);

  if (!primary) return null;

  return {
    primaryAddress: primary.address.toLowerCase(),
    allAddresses,
    walletCount: allAddresses.length,
  };
}
