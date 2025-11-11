#!/usr/bin/env node

/**
 * Test Script: CORS Middleware
 *
 * Tests that apps/app allows requests from:
 * - predik.io
 * - staging.predik.io
 * - app.predik.io
 * - Vercel preview deployments
 *
 * Run: node scripts/test-cors.mjs
 */

const APP_URL = process.env.TEST_APP_URL || "http://localhost:3001";

const TESTS = [
  {
    name: "Production web origin",
    origin: "https://predik.io",
    shouldPass: true,
  },
  {
    name: "Staging web origin",
    origin: "https://staging.predik.io",
    shouldPass: true,
  },
  {
    name: "Production app origin",
    origin: "https://app.predik.io",
    shouldPass: true,
  },
  {
    name: "Vercel preview deployment",
    origin: "https://predik-git-feature-abc-predik.vercel.app",
    shouldPass: true,
  },
  {
    name: "Unauthorized origin",
    origin: "https://evil.com",
    shouldPass: false,
  },
  {
    name: "No origin header",
    origin: null,
    shouldPass: false,
  },
];

async function testCORS(test) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (test.origin) {
    headers["Origin"] = test.origin;
  }

  try {
    const response = await fetch(`${APP_URL}/api/markets`, {
      method: "GET",
      headers,
    });

    const corsHeader = response.headers.get("Access-Control-Allow-Origin");
    const passed = test.shouldPass
      ? corsHeader === test.origin
      : !corsHeader || corsHeader !== test.origin;

    return {
      passed,
      corsHeader,
      status: response.status,
    };
  } catch (error) {
    return {
      passed: false,
      error: error.message,
    };
  }
}

async function runTests() {
  console.log("🧪 Testing CORS Middleware\n");
  console.log(`Target: ${APP_URL}\n`);

  let passedCount = 0;
  let failedCount = 0;

  for (const test of TESTS) {
    const result = await testCORS(test);

    if (result.passed) {
      console.log(`✅ ${test.name}`);
      console.log(`   Origin: ${test.origin || "none"}`);
      console.log(`   CORS Header: ${result.corsHeader || "none"}\n`);
      passedCount++;
    } else {
      console.log(`❌ ${test.name}`);
      console.log(`   Origin: ${test.origin || "none"}`);
      console.log(`   Expected: ${test.shouldPass ? "allowed" : "blocked"}`);
      console.log(`   CORS Header: ${result.corsHeader || "none"}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      console.log("");
      failedCount++;
    }
  }

  console.log("━".repeat(50));
  console.log(`\n📊 Results: ${passedCount} passed, ${failedCount} failed\n`);

  if (failedCount > 0) {
    console.log("❌ Some tests failed. Check middleware configuration.\n");
    process.exit(1);
  } else {
    console.log("✅ All CORS tests passed!\n");
  }
}

runTests().catch((error) => {
  console.error("💥 Test runner error:", error);
  process.exit(1);
});
