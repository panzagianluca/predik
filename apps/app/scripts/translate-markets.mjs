#!/usr/bin/env node
/**
 * Script to translate all current markets from Myriad
 * Run: node scripts/translate-markets.mjs
 */

import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

// Load environment variables from .env.local
config({ path: ".env.local" });

// Google Translate (free, no API key needed)
async function translateToSpanish(text) {
  try {
    // Using Google Translate free API endpoint
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=${encodeURIComponent(
      text,
    )}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error("Google Translate error:", response.status);
      return text;
    }

    const data = await response.json();
    // Google Translate returns nested arrays: [[[translated_text, original_text, ...]]]
    const translated = data[0].map((item) => item[0]).join("");
    return translated;
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

  console.log(`✅ Title: "${titleEs}"`);

  return {
    titleEs,
    descriptionEs,
    titleEn: market.title,
    descriptionEn: market.description,
  };
}

async function main() {
  console.log("🔄 Starting market translation process...\n");

  // Connect to database using Neon serverless
  const sql = neon(process.env.DATABASE_URL);

  // Myriad API configuration
  const MYRIAD_API_URL =
    process.env.NEXT_PUBLIC_MYRIAD_API_URL ||
    "https://api-v2.myriadprotocol.com";
  const MYRIAD_API_KEY = process.env.MYRIAD_API_KEY;

  try {
    // 1. Fetch OPEN markets from Myriad on BNB MAINNET (networkId 56), excluding 5 Min Candles
    console.log(
      "📡 Fetching OPEN markets from Myriad (BNB MAINNET - networkId 56)...",
    );
    let allMarkets = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(
        `${MYRIAD_API_URL}/markets?state=open&networkId=56&page=${page}&limit=100`,
        {
          headers: {
            "x-api-key": MYRIAD_API_KEY,
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch markets: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      const markets = (data.data || []).filter(
        (m) => !m.title.includes("5 Min Candle"),
      );
      allMarkets = allMarkets.concat(markets);

      hasMore = data.pagination?.hasNext || false;
      page++;

      console.log(
        `  Page ${page - 1}: ${markets.length} markets (Total so far: ${
          allMarkets.length
        })`,
      );

      // Respect rate limits
      if (hasMore) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    console.log(
      `✅ Found ${allMarkets.length} open BNB markets (excluding 5 Min Candles)\n`,
    );

    // 2. Check which markets already have translations
    console.log("🔍 Checking existing translations...");
    const result = await sql`
      SELECT market_id FROM market_translations
    `;

    const translatedIds = new Set(result.map((row) => row.market_id));
    console.log(`✅ Found ${translatedIds.size} already translated\n`);

    // 3. Filter markets that need translation
    const marketsToTranslate = allMarkets.filter(
      (m) => !translatedIds.has(m.id),
    );

    if (marketsToTranslate.length === 0) {
      console.log("🎉 All markets are already translated!");
      return;
    }

    console.log(`📝 Need to translate ${marketsToTranslate.length} markets\n`);

    // 4. Translate and insert each market
    let successCount = 0;
    let errorCount = 0;

    for (const market of marketsToTranslate) {
      try {
        const translations = await translateMarket(market);

        // Insert translation
        await sql`
          INSERT INTO market_translations (
            market_id,
            market_slug,
            title_es,
            description_es,
            title_en,
            description_en,
            translated_at,
            updated_at
          )
          VALUES (
            ${market.id},
            ${market.slug},
            ${translations.titleEs},
            ${translations.descriptionEs},
            ${translations.titleEn},
            ${translations.descriptionEn},
            NOW(),
            NOW()
          )
          ON CONFLICT (market_id) DO NOTHING
        `;

        successCount++;
        console.log(`✅ Saved translation for market ${market.id}`);

        // Be nice to the API (rate limiting)
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(
          `❌ Error translating market ${market.id}:`,
          error.message,
        );
        errorCount++;
      }
    }

    // 5. Summary
    console.log("\n" + "=".repeat(50));
    console.log("📊 Translation Summary:");
    console.log(`✅ Successfully translated: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📦 Total in database: ${translatedIds.size + successCount}`);
    console.log("=".repeat(50));
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
}

main();
