import { logger } from "@/lib/logger";

// Hook to fetch user profile data
export async function fetchUserProfile(walletAddress: string) {
  try {
    // Add cache-busting timestamp to force fresh data
    const timestamp = Date.now();
    const response = await fetch(
      `/api/profile/update?walletAddress=${walletAddress}&_t=${timestamp}`,
      {
        cache: "no-store", // Prevent caching
      },
    );
    if (!response.ok) return null;

    const data = await response.json();
    return {
      username: data.username,
      customAvatar: data.customAvatar,
    };
  } catch (error) {
    logger.error("Error fetching user profile:", error);
    return null;
  }
}

// Format wallet address for display
export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
