/**
 * PostHog Debug Script
 *
 * Run this in your browser console when the app is loaded
 * to check if PostHog is properly initialized
 */

console.log("🔍 PostHog Debug Check\n");

// Check 1: PostHog instance
console.log("1️⃣ PostHog Instance:");
if (window.posthog) {
  console.log("✅ PostHog is loaded");
  console.log("   Config:", window.posthog.config);
} else {
  console.log("❌ PostHog is NOT loaded");
  console.log("   Possible reasons:");
  console.log("   - Cookie consent not given");
  console.log("   - API key not configured");
  console.log("   - Ad blocker active");
}

console.log("\n2️⃣ Cookie Consent:");
const consent = localStorage.getItem("cookie-consent");
if (consent) {
  try {
    const parsed = JSON.parse(consent);
    console.log("✅ Consent found:", parsed);
    if (parsed.behavioral) {
      console.log("   ✅ Behavioral tracking: ENABLED");
    } else {
      console.log("   ❌ Behavioral tracking: DISABLED (PostHog won't work)");
    }
  } catch (e) {
    console.log("❌ Invalid consent data");
  }
} else {
  console.log("❌ No consent found - user hasn't accepted cookies");
}

console.log("\n3️⃣ Environment Variables:");
console.log(
  "   PostHog Key:",
  process.env.NEXT_PUBLIC_POSTHOG_KEY ? "SET" : "NOT SET",
);
console.log("   PostHog Host:", process.env.NEXT_PUBLIC_POSTHOG_HOST);

console.log("\n4️⃣ Network Check:");
console.log("   Open DevTools → Network tab");
console.log("   Filter by: 'ingest'");
console.log("   Look for POST requests to /ingest/batch or /ingest/e");

console.log("\n5️⃣ Test Event:");
console.log("   Run this command to test:");
console.log("   window.posthog?.capture('test_event', { test: true })");

console.log("\n6️⃣ Manual Test:");
if (window.posthog) {
  window.posthog.capture("debug_test_event", {
    timestamp: new Date().toISOString(),
    test: true,
  });
  console.log("✅ Sent test event: debug_test_event");
  console.log("   Check PostHog Activity in ~30 seconds");
} else {
  console.log("❌ Cannot send test - PostHog not loaded");
}
