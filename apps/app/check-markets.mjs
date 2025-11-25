import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);
const MYRIAD_API_URL = "https://api-v2.myriadprotocol.com";
const MYRIAD_API_KEY = process.env.MYRIAD_API_KEY;

async function main() {
  // Get markets from DB
  const dbMarkets = await sql`
    SELECT market_id, market_slug FROM market_translations
  `;
  console.log(`📦 DB has ${dbMarkets.length} translated markets\n`);

  // Get open markets from Myriad on BNB (networkId 56)
  console.log(
    "📡 Fetching open markets from Myriad (BNB Chain - networkId 56)...",
  );
  const response = await fetch(
    `${MYRIAD_API_URL}/markets?state=open&networkId=56&limit=100`,
    {
      headers: { "x-api-key": MYRIAD_API_KEY },
    },
  );

  const data = await response.json();
  const openMarkets = (data.data || []).filter(
    (m) => !m.title.includes("5 Min Candle"),
  );
  console.log(
    `🟢 Myriad has ${openMarkets.length} open markets on BNB (excluding 5 Min Candles)\n`,
  );

  // Check which ones need translation
  const dbIds = new Set(dbMarkets.map((m) => m.market_id));
  const newMarkets = openMarkets.filter((m) => !dbIds.has(m.id));

  console.log(`🆕 Need to translate ${newMarkets.length} new markets:\n`);
  newMarkets.slice(0, 20).forEach((m) => {
    console.log(`  - [${m.id}] ${m.title}`);
  });

  if (newMarkets.length > 20) {
    console.log(`\n  ... and ${newMarkets.length - 20} more`);
  }
}

main().catch(console.error);
