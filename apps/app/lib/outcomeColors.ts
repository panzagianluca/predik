/**
 * Outcome Color Utility
 *
 * Determines the color for market outcomes based on their title.
 * Priority:
 *   1. Directional (Yes/No, Arriba/Abajo)
 *   2. Crypto brands (BTC, ETH, SOL, etc.)
 *   3. Sports teams (fuzzy match)
 *   4. Fallback palette (12 colors, no green/red)
 */

// Tier 2: Crypto brand colors
const cryptoColors: Record<string, string> = {
  btc: "#F7931A",
  bitcoin: "#F7931A",
  eth: "#627EEA",
  ethereum: "#627EEA",
  sol: "#9945FF",
  solana: "#9945FF",
  gold: "#FFD700",
  oro: "#FFD700",
  xau: "#FFD700",
  bnb: "#F3BA2F",
  xrp: "#23292F",
  ada: "#0033AD",
  cardano: "#0033AD",
  doge: "#C2A633",
  dogecoin: "#C2A633",
  matic: "#8247E5",
  polygon: "#8247E5",
  avax: "#E84142",
  avalanche: "#E84142",
  link: "#2A5ADA",
  chainlink: "#2A5ADA",
};

// Tier 3: Sports team colors (fuzzy match)
const teamColors: Record<string, string> = {
  // Argentina - Football
  boca: "#0033A0",
  "boca juniors": "#0033A0",
  river: "#D20515",
  "river plate": "#D20515",
  racing: "#75AADB",
  independiente: "#FF0000",
  "san lorenzo": "#00529B",
  huracan: "#FFFFFF",
  velez: "#0055A4",
  estudiantes: "#FF0000",
  gimnasia: "#0055A4",
  newells: "#D20515",
  rosario: "#0055A4",
  talleres: "#0055A4",
  belgrano: "#75AADB",
  // European - Football
  barcelona: "#A50044",
  "real madrid": "#FEBE10",
  atletico: "#CB3524",
  "atletico madrid": "#CB3524",
  manchester: "#DA291C",
  "man united": "#DA291C",
  "man city": "#6CABDD",
  liverpool: "#C8102E",
  chelsea: "#034694",
  arsenal: "#EF0107",
  tottenham: "#132257",
  juventus: "#000000",
  milan: "#FB090B",
  inter: "#0068A8",
  psg: "#004170",
  bayern: "#DC052D",
  dortmund: "#FDE100",
  // National teams
  argentina: "#75AADB",
  brasil: "#009739",
  brazil: "#009739",
  alemania: "#000000",
  germany: "#000000",
  francia: "#002395",
  france: "#002395",
  espana: "#AA151B",
  spain: "#AA151B",
  italia: "#0066B2",
  italy: "#0066B2",
  portugal: "#006600",
  england: "#FFFFFF",
  inglaterra: "#FFFFFF",
  // NBA
  lakers: "#552583",
  celtics: "#007A33",
  warriors: "#1D428A",
  bulls: "#CE1141",
  heat: "#98002E",
  knicks: "#F58426",
  nets: "#000000",
  sixers: "#006BB6",
  "76ers": "#006BB6",
  bucks: "#00471B",
  suns: "#1D1160",
  mavericks: "#00538C",
  clippers: "#C8102E",
  // NFL
  chiefs: "#E31837",
  eagles: "#004C54",
  cowboys: "#003594",
  patriots: "#002244",
  packers: "#203731",
  "49ers": "#AA0000",
  ravens: "#241773",
  bills: "#00338D",
};

// Tier 4: Fallback palette (12 colors, avoids green/red)
const fallbackColors = [
  "#3B82F6", // Blue
  "#8B5CF6", // Violet
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#EC4899", // Pink
  "#14B8A6", // Teal
  "#A855F7", // Purple
  "#F59E0B", // Amber
  "#6366F1", // Indigo
  "#84CC16", // Lime
  "#0EA5E9", // Sky blue
  "#D946EF", // Fuchsia
];

// Standard colors
const GREEN = "#22c55e";
const RED = "#ef4444";

/**
 * Get the appropriate color for an outcome based on its title
 * @param title - The outcome title (e.g., "Sí", "No", "Bitcoin", "Boca Juniors")
 * @param index - The outcome index (used for fallback palette)
 * @returns Hex color string
 */
export function getOutcomeColor(title: string, index: number = 0): string {
  const normalized = title.toLowerCase().trim();

  // Tier 1: Directional keywords (Yes/No, Up/Down)
  const greenKeywords = ["sí", "si", "yes", "arriba", "above"];
  const redKeywords = ["no", "abajo", "below"];

  if (greenKeywords.includes(normalized)) {
    return GREEN;
  }
  if (redKeywords.includes(normalized)) {
    return RED;
  }

  // Tier 2: Crypto brands (exact or contains match)
  for (const [keyword, color] of Object.entries(cryptoColors)) {
    if (normalized === keyword || normalized.includes(keyword)) {
      return color;
    }
  }

  // Tier 3: Sports teams (fuzzy match - check if title contains team name)
  for (const [team, color] of Object.entries(teamColors)) {
    if (normalized.includes(team)) {
      return color;
    }
  }

  // Tier 4: Fallback palette
  return fallbackColors[index % fallbackColors.length];
}

/**
 * Check if an outcome is a "positive" outcome (Yes/Up/Arriba)
 * Useful for styling decisions beyond just color
 */
export function isPositiveOutcome(title: string): boolean {
  const normalized = title.toLowerCase().trim();
  return ["sí", "si", "yes", "arriba", "above"].includes(normalized);
}

/**
 * Check if an outcome is a "negative" outcome (No/Down/Abajo)
 */
export function isNegativeOutcome(title: string): boolean {
  const normalized = title.toLowerCase().trim();
  return ["no", "abajo", "below"].includes(normalized);
}

/**
 * Check if the market is a simple Yes/No market
 */
export function isYesNoMarket(outcomes: { title: string }[]): boolean {
  if (outcomes.length !== 2) return false;
  const titles = outcomes.map((o) => o.title.toLowerCase().trim());
  const hasYes = titles.some((t) => ["sí", "si", "yes"].includes(t));
  const hasNo = titles.some((t) => t === "no");
  return hasYes && hasNo;
}
