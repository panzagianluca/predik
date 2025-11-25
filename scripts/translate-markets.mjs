#!/usr/bin/env node
/**
 * Script to check and translate new markets
 * Run: node scripts/translate-markets.mjs
 */

import "dotenv/config";
import pg from "pg";

const { Client } = pg;

// Connect to database
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

await client.connect();
console.log("✅ Connected to database\n");

// Fetch all translated markets
const result = await client.query(`
  SELECT
    market_id,
    market_slug,
    title_en,
    title_es,
    LEFT(description_en, 60) as desc_preview,
    translated_at
  FROM market_translations
  ORDER BY translated_at DESC
  LIMIT 20
`);

console.log(`📊 Found ${result.rows.length} translated markets:\n`);

result.rows.forEach((row, i) => {
  console.log(`${i + 1}. Market ID: ${row.market_id}`);
  console.log(`   Slug: ${row.market_slug}`);
  console.log(`   EN: ${row.title_en}`);
  console.log(`   ES: ${row.title_es}`);
  console.log(
    `   Translated: ${new Date(row.translated_at).toLocaleDateString()}`,
  );
  console.log("");
});

// Check if DeepL key is configured
if (process.env.DEEPL_API_KEY) {
  console.log("✅ DeepL API Key is configured");
} else {
  console.log("❌ DeepL API Key is NOT configured");
}

await client.end();
