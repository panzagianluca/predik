import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });
const sql = neon(process.env.DATABASE_URL);

const titles = [
  "Bitcoin's next move: Pump to $105K or Dump to $69K?",
  "Will Steve Harrington die in Stranger Things Season 5?",
  "Will Pope Leo XIV be the #1 Searched Person on Google this year?",
  "Will Brian Armstrong appear in the first episode of UpOnly?",
];

async function check() {
  for (const title of titles) {
    const result = await sql`
      SELECT market_id, title_en, title_es FROM market_translations
      WHERE title_en = ${title}
    `;
    console.log(`"${title}"`);
    if (result.length > 0) {
      console.log(`  ✅ IN DB: "${result[0].title_es}"`);
    } else {
      console.log(`  ❌ NOT IN DB`);
    }
    console.log("");
  }
}

check();
