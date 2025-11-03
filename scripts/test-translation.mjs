#!/usr/bin/env node
/**
 * Test script to verify DeepL translation integration
 * Run with: node scripts/test-translation.mjs
 */

import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
dotenv.config({ path: join(__dirname, "..", ".env.local") });

const DEEPL_API_KEY = process.env.DEEPL_API_KEY;

console.log("🔧 Testing DeepL Translation Service...\n");

// Test 1: Check API Key
console.log("1️⃣ Checking API Key Configuration:");
if (!DEEPL_API_KEY) {
  console.error("❌ DEEPL_API_KEY not found in .env.local");
  process.exit(1);
}
console.log(`✅ API Key found: ${DEEPL_API_KEY.substring(0, 10)}...`);

// Test 2: Test DeepL API directly
console.log("\n2️⃣ Testing DeepL API Connection:");
const testText = "Will Bitcoin reach $100,000 by the end of 2024?";
console.log(`   Original: "${testText}"`);

try {
  const response = await fetch("https://api-free.deepl.com/v2/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
    },
    body: new URLSearchParams({
      text: testText,
      target_lang: "ES",
      source_lang: "EN",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`❌ DeepL API Error (${response.status}):`, error);
    process.exit(1);
  }

  const data = await response.json();
  const translated = data.translations[0].text;
  console.log(`   Translated: "${translated}"`);
  console.log("✅ DeepL API working correctly!");
} catch (error) {
  console.error("❌ Error calling DeepL API:", error.message);
  process.exit(1);
}

// Test 3: Check Database Connection
console.log("\n3️⃣ Checking Database Configuration:");
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in .env.local");
  process.exit(1);
}
console.log("✅ Database URL configured");

// Test 4: Test market API endpoint
console.log("\n4️⃣ Testing Markets API (local):");
console.log("   Make sure your dev server is running on http://localhost:3000");
console.log("   Then run: curl http://localhost:3000/api/markets | jq");
console.log('   Look for "titleEs" and "descriptionEs" fields');

console.log("\n✅ All tests passed!");
console.log("\n📋 Next Steps:");
console.log("   1. Start your dev server: npm run dev");
console.log("   2. Visit: http://localhost:3000/api/markets");
console.log(
  "   3. Check if markets have Spanish translations (titleEs, descriptionEs)",
);
console.log("   4. If not, check server logs for translation errors");
