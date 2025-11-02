import { logger } from "./logger";

/**
 * Profile Picture Utility Functions
 *
 * Handles random assignment and persistence of default profile pictures
 * based on wallet addresses using localStorage.
 */

const PROFILE_PICTURES = [
  "/profiles/imgProfile1.jpg",
  "/profiles/imgProfile2.jpg",
  "/profiles/imgProfile3.jpg",
  "/profiles/imgProfile4.jpg",
  "/profiles/imgProfile5.jpg",
  "/profiles/imgProfile6.jpg",
  "/profiles/imgProfile7.jpg",
];

const STORAGE_KEY = "predik_user_profiles";

/**
 * Get stored profile assignments from localStorage
 */
function getStoredProfiles(): Record<string, string> {
  if (typeof window === "undefined") return {};

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (err) {
    logger.error("Error reading profile assignments:", err);
    return {};
  }
}

/**
 * Save profile assignments to localStorage
 */
function saveProfiles(profiles: Record<string, string>): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch (err) {
    logger.error("Error saving profile assignments:", err);
  }
}

/**
 * Generate a deterministic index from wallet address
 * This ensures the same wallet always gets the same avatar (unless manually changed)
 */
function getIndexFromAddress(address: string): number {
  // Simple hash function to convert address to index
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = (hash << 5) - hash + address.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) % PROFILE_PICTURES.length;
}

/**
 * Get profile picture for a wallet address
 * If not assigned yet, randomly assigns one and persists it
 *
 * @param address - Wallet address (0x...)
 * @returns Path to profile picture
 */
export function getProfilePicture(address: string | undefined): string {
  if (!address) return PROFILE_PICTURES[0]; // Default fallback

  const normalizedAddress = address.toLowerCase();
  const profiles = getStoredProfiles();

  // Check if already assigned
  if (profiles[normalizedAddress]) {
    const existingPath = profiles[normalizedAddress];

    // MIGRATION: If old SVG avatar, migrate to new JPG
    if (existingPath.includes("avatar-") && existingPath.endsWith(".svg")) {
      logger.info(
        `Migrating old SVG profile to JPG for ${normalizedAddress.slice(
          0,
          6,
        )}...`,
      );
      // Assign new JPG based on address hash
      const index = getIndexFromAddress(normalizedAddress);
      const newPicture = PROFILE_PICTURES[index];
      profiles[normalizedAddress] = newPicture;
      saveProfiles(profiles);
      return newPicture;
    }

    return existingPath;
  }

  // Otherwise, assign based on address hash for consistency
  const index = getIndexFromAddress(normalizedAddress);
  const assignedPicture = PROFILE_PICTURES[index];

  // Save the assignment
  profiles[normalizedAddress] = assignedPicture;
  saveProfiles(profiles);

  return assignedPicture;
}

/**
 * Change profile picture for a wallet address
 *
 * @param address - Wallet address
 * @param pictureIndex - Index of the new profile picture (0-9)
 */
export function changeProfilePicture(
  address: string,
  pictureIndex: number,
): void {
  if (pictureIndex < 0 || pictureIndex >= PROFILE_PICTURES.length) {
    throw new Error(
      `Invalid picture index: ${pictureIndex}. Must be between 0 and ${
        PROFILE_PICTURES.length - 1
      }`,
    );
  }

  const normalizedAddress = address.toLowerCase();
  const profiles = getStoredProfiles();
  profiles[normalizedAddress] = PROFILE_PICTURES[pictureIndex];
  saveProfiles(profiles);
}

/**
 * Get all available profile pictures
 */
export function getAllProfilePictures(): string[] {
  return [...PROFILE_PICTURES];
}
