import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });
const sql = neon(process.env.DATABASE_URL);

async function check() {
  const recent = await sql`
    SELECT market_id, market_slug, title_en, title_es, updated_at
    FROM market_translations
    ORDER BY updated_at DESC
    LIMIT 15
  `;

  console.log("Most recently updated translations:\n");
  recent.forEach((r) => {
    console.log(`ID ${r.market_id}: ${r.title_en}`);
    console.log(`  ES: ${r.title_es}`);
    console.log(`  Updated: ${r.updated_at}\n`);
  });

  const total = await sql`SELECT COUNT(*) as count FROM market_translations`;
  console.log(`\nTotal translations in DB: ${total[0].count}`);
}

check();
