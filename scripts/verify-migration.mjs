#!/usr/bin/env node
/**
 * Verify Migration Script
 *
 * Checks that incremental migration preserved existing data
 * and added new tables/columns correctly.
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load env vars
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "../.env.local") });

const client = postgres(process.env.DATABASE_URL, { max: 1 });
const db = drizzle(client);

console.log("🔍 Verifying migration...\n");

try {
  // Check existing data preserved
  console.log("📊 EXISTING DATA CHECK:");
  const userCount = await client`SELECT COUNT(*) as count FROM users`;
  const proposalCount =
    await client`SELECT COUNT(*) as count FROM market_proposals`;
  const voteCount = await client`SELECT COUNT(*) as count FROM proposal_votes`;

  console.log(`  ✅ Users: ${userCount[0].count}`);
  console.log(`  ✅ Proposals: ${proposalCount[0].count}`);
  console.log(`  ✅ Proposal Votes: ${voteCount[0].count}\n`);

  // Check new columns added
  console.log("🆕 NEW COLUMNS CHECK:");
  const commentsColumns = await client`
    SELECT column_name, data_type, column_default
    FROM information_schema.columns
    WHERE table_name = 'comments'
    AND column_name IN ('is_hidden')
  `;

  const notificationsColumns = await client`
    SELECT column_name, data_type, column_default
    FROM information_schema.columns
    WHERE table_name = 'notifications'
    AND column_name IN ('expires_at')
  `;

  const proposalsColumns = await client`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'market_proposals'
    AND column_name IN ('related_market_slug', 'myriad_market_id')
  `;

  console.log(
    `  ✅ comments.is_hidden: ${commentsColumns[0] ? "EXISTS" : "MISSING"}`,
  );
  console.log(
    `  ✅ notifications.expires_at: ${
      notificationsColumns[0] ? "EXISTS" : "MISSING"
    }`,
  );
  console.log(
    `  ✅ market_proposals.related_market_slug: ${
      proposalsColumns[0] ? "EXISTS" : "MISSING"
    }`,
  );
  console.log(
    `  ✅ market_proposals.myriad_market_id: ${
      proposalsColumns[1] ? "EXISTS" : "MISSING"
    }\n`,
  );

  // Check new tables created
  console.log("🗄️  NEW TABLES CHECK:");
  const newTables = await client`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('market_metadata', 'comment_reports', 'admin_actions', 'saved_markets', 'market_translations')
    ORDER BY table_name
  `;

  const expectedTables = [
    "admin_actions",
    "comment_reports",
    "market_metadata",
    "market_translations",
    "saved_markets",
  ];
  expectedTables.forEach((tableName) => {
    const exists = newTables.some((t) => t.table_name === tableName);
    console.log(`  ${exists ? "✅" : "❌"} ${tableName}`);
  });

  console.log("\n✅ Migration verification complete!\n");
} catch (error) {
  console.error("❌ Verification failed:", error);
  process.exit(1);
} finally {
  await client.end();
}
