#!/usr/bin/env node
/**
 * Script to translate all current markets from Myriad
 * Run from app: cd apps/app && node ../../scripts/translate-all-markets.mjs
 */

import "dotenv/config";
import { neon } from "@neondatabase/serverless";

// DeepL Translation
async function translateToSpanish(text) {
  if (!process.env.DEEPL_API_KEY) {
    console.error("❌ DEEPL_API_KEY not configured");
    return text;
  }

  try {
    const response = await fetch("https://api-free.deepl.com/v2/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
      },
      body: new URLSearchParams({
        text: text,
        target_lang: "ES",
        source_lang: "EN",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("DeepL API error:", response.status, error);
      return text;
    }

    const data = await response.json();
    return data.translations[0].text;
  } catch (error) {
    console.error("Translation error:", error.message);
    return text;
  }
}

async function translateMarket(market) {
  console.log(`\n🔄 Translating: "${market.title}"`);

  const [titleEs, descriptionEs] = await Promise.all([
    translateToSpanish(market.title),
    translateToSpanish(market.description),
  ]);

  return { titleEs, descriptionEs };
}

// Main script
async function main() {
  console.log("🚀 Starting market translation...\n");

  // Connect to database
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();
  console.log("✅ Connected to database\n");

  // Fetch markets from Myriad
  console.log("📥 Fetching markets from Myriad Protocol...");
  const response = await fetch("https://myriad.markets/api/markets", {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch markets: ${response.status}`);
  }

  const markets = await response.json();
  console.log(`✅ Found ${markets.length} markets\n`);

  // Filter out already translated markets
  const existingResult = await client.query(
    "SELECT market_id FROM market_translations",
  );
  const existingIds = new Set(existingResult.rows.map((r) => r.market_id));

  const marketsToTranslate = markets.filter((m) => !existingIds.has(m.id));

  console.log(`📊 Already translated: ${existingIds.size}`);
  console.log(`📊 Need translation: ${marketsToTranslate.length}\n`);

  if (marketsToTranslate.length === 0) {
    console.log("✨ All markets are already translated!");
    await client.end();
    return;
  }

  let translated = 0;
  let failed = 0;
  let skipped = 0;

  // Translate each market
  for (const market of marketsToTranslate) {
    try {
      const { titleEs, descriptionEs } = await translateMarket(market);

      // Check if it was actually translated (not just returned English)
      if (titleEs === market.title && descriptionEs === market.description) {
        console.log(
          `⚠️  Skipped (quota exceeded): ${market.title.substring(0, 50)}...`,
        );
        skipped++;
        continue;
      }

      // Save to database
      await client.query(
        `INSERT INTO market_translations
         (market_id, market_slug, title_es, description_es, title_en, description_en)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (market_id) DO NOTHING`,
        [
          market.id,
          market.slug,
          titleEs,
          descriptionEs,
          market.title,
          market.description,
        ],
      );

      console.log(`✅ Saved: ${titleEs.substring(0, 50)}...`);
      translated++;

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(
        `❌ Failed to translate market ${market.id}:`,
        error.message,
      );
      failed++;
    }
  }

  await client.end();

  console.log("\n" + "=".repeat(50));
  console.log("📊 Translation Summary:");
  console.log(`   ✅ Successfully translated: ${translated}`);
  console.log(`   ⚠️  Skipped (quota): ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log("=".repeat(50));
}

main().catch(console.error);
