import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });
const sql = neon(process.env.DATABASE_URL);

async function check() {
  // Check specific market IDs that are open
  const marketIds = [213, 375, 401, 376, 571];

  console.log("Checking if these open markets have translations in DB:\n");

  for (const id of marketIds) {
    const result = await sql`
      SELECT market_id, title_en, title_es FROM market_translations
      WHERE market_id = ${id}
    `;
    if (result.length > 0) {
      console.log(`✅ Market ${id}: "${result[0].title_en}"`);
      console.log(`   ES: "${result[0].title_es}"\n`);
    } else {
      console.log(`❌ Market ${id}: NOT IN DB\n`);
    }
  }

  // Count total
  const total = await sql`SELECT COUNT(*) as count FROM market_translations`;
  console.log(`\nTotal translations in DB: ${total[0].count}`);

  // Check newest translations
  console.log("\n--- Most recent translations ---");
  const recent = await sql`
    SELECT market_id, title_en, updated_at
    FROM market_translations
    ORDER BY updated_at DESC
    LIMIT 5
  `;
  recent.forEach((r) => {
    console.log(`${r.market_id}: ${r.title_en} (${r.updated_at})`);
  });
}

check();
