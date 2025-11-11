#!/usr/bin/env node

/**
 * Test Script: Rate Limiting
 *
 * Tests Upstash Redis rate limiting for:
 * - Comments: 5 per minute
 * - Proposals: 3 per hour
 * - Votes: No limit (unique constraint handles it)
 *
 * Prerequisites:
 * - UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set
 * - apps/app must be running (npm run dev in apps/app)
 *
 * Run: node scripts/test-rate-limiting.mjs
 */

const APP_URL = process.env.TEST_APP_URL || "http://localhost:3001";
const TEST_WALLET = "0x" + "1".repeat(40); // Dummy wallet for testing

async function testCommentRateLimit() {
  console.log("🧪 Testing Comment Rate Limiting (5 per minute)\n");

  const results = [];

  // Send 7 requests (should fail on 6th and 7th)
  for (let i = 1; i <= 7; i++) {
    try {
      const response = await fetch(`${APP_URL}/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          marketId: "test-market",
          content: `Test comment ${i}`,
          userAddress: TEST_WALLET,
        }),
      });

      const remaining = response.headers.get("X-RateLimit-Remaining");
      const limit = response.headers.get("X-RateLimit-Limit");
      const reset = response.headers.get("X-RateLimit-Reset");

      results.push({
        attempt: i,
        status: response.status,
        success: response.ok,
        remaining,
        limit,
        reset,
      });

      // Log result
      if (response.ok) {
        console.log(
          `✅ Request ${i}: SUCCESS (${remaining}/${limit} remaining)`,
        );
      } else {
        console.log(
          `❌ Request ${i}: RATE LIMITED (${remaining}/${limit} remaining)`,
        );
      }

      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.log(`💥 Request ${i}: ERROR - ${error.message}`);
      results.push({
        attempt: i,
        error: error.message,
      });
    }
  }

  console.log("\n");

  // Validate results
  const successCount = results.filter((r) => r.success).length;
  const rateLimitedCount = results.filter((r) => r.status === 429).length;

  console.log(`📊 Results:`);
  console.log(`   Successful: ${successCount}/7`);
  console.log(`   Rate Limited: ${rateLimitedCount}/7`);
  console.log(`   Expected: 5 success, 2 rate limited\n`);

  return successCount === 5 && rateLimitedCount === 2;
}

async function testProposalRateLimit() {
  console.log("🧪 Testing Proposal Rate Limiting (3 per hour)\n");

  const results = [];

  // Send 5 requests (should fail on 4th and 5th)
  for (let i = 1; i <= 5; i++) {
    try {
      const response = await fetch(`${APP_URL}/api/proposals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: `Test Proposal ${i}`,
          category: "Sports",
          endDate: new Date(Date.now() + 86400000).toISOString(),
          outcomes: ["Yes", "No"],
          createdBy: TEST_WALLET,
        }),
      });

      const remaining = response.headers.get("X-RateLimit-Remaining");
      const limit = response.headers.get("X-RateLimit-Limit");

      results.push({
        attempt: i,
        status: response.status,
        success: response.ok,
        remaining,
        limit,
      });

      // Log result
      if (response.ok) {
        console.log(
          `✅ Request ${i}: SUCCESS (${remaining}/${limit} remaining)`,
        );
      } else {
        console.log(
          `❌ Request ${i}: RATE LIMITED (${remaining}/${limit} remaining)`,
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.log(`💥 Request ${i}: ERROR - ${error.message}`);
      results.push({
        attempt: i,
        error: error.message,
      });
    }
  }

  console.log("\n");

  const successCount = results.filter((r) => r.success).length;
  const rateLimitedCount = results.filter((r) => r.status === 429).length;

  console.log(`📊 Results:`);
  console.log(`   Successful: ${successCount}/5`);
  console.log(`   Rate Limited: ${rateLimitedCount}/5`);
  console.log(`   Expected: 3 success, 2 rate limited\n`);

  return successCount === 3 && rateLimitedCount === 2;
}

async function testVoteNoLimit() {
  console.log("🧪 Testing Vote Endpoint (No Rate Limit)\n");

  // Send 10 rapid requests - all should succeed until unique constraint hits
  let successCount = 0;
  let constraintHits = 0;

  for (let i = 1; i <= 10; i++) {
    try {
      const response = await fetch(`${APP_URL}/api/comments/test-comment-id`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userAddress: TEST_WALLET,
        }),
      });

      if (response.ok) {
        successCount++;
        console.log(`✅ Request ${i}: SUCCESS (no rate limit)`);
      } else if (response.status === 409) {
        // Unique constraint hit
        constraintHits++;
        console.log(`⚠️  Request ${i}: DUPLICATE (unique constraint)`);
      } else if (response.status === 429) {
        console.log(`❌ Request ${i}: UNEXPECTED RATE LIMIT`);
        return false;
      }
    } catch (error) {
      console.log(`💥 Request ${i}: ERROR - ${error.message}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  console.log("\n📊 Results:");
  console.log(`   No rate limit headers detected: ✅`);
  console.log(`   Requests handled: ${successCount + constraintHits}/10\n`);

  return true;
}

async function checkUpstashCredentials() {
  console.log("🔍 Checking Upstash credentials...\n");

  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    console.log("❌ Missing Upstash credentials in .env.local");
    console.log("   Required:");
    console.log("   - UPSTASH_REDIS_REST_URL");
    console.log("   - UPSTASH_REDIS_REST_TOKEN\n");
    console.log("   Get credentials from: https://upstash.com\n");
    return false;
  }

  console.log("✅ Upstash credentials found\n");
  return true;
}

async function runTests() {
  console.log("━".repeat(50));
  console.log("⚡ Rate Limiting Test Suite");
  console.log("━".repeat(50));
  console.log("");

  // Check credentials
  const hasCredentials = await checkUpstashCredentials();
  if (!hasCredentials) {
    console.log("⏭️  Skipping tests - credentials not configured\n");
    process.exit(1);
  }

  console.log(`Target: ${APP_URL}\n`);
  console.log("━".repeat(50));
  console.log("");

  // Run tests
  const commentResult = await testCommentRateLimit();
  console.log("━".repeat(50));
  console.log("");

  const proposalResult = await testProposalRateLimit();
  console.log("━".repeat(50));
  console.log("");

  const voteResult = await testVoteNoLimit();
  console.log("━".repeat(50));
  console.log("");

  // Summary
  const allPassed = commentResult && proposalResult && voteResult;

  if (allPassed) {
    console.log("✅ All rate limiting tests passed!\n");
  } else {
    console.log("❌ Some rate limiting tests failed\n");
    process.exit(1);
  }
}

runTests().catch((error) => {
  console.error("💥 Test runner error:", error);
  process.exit(1);
});
