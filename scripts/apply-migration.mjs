#!/usr/bin/env node
/**
 * Direct SQL Migration Applicator
 *
 * Applies migration SQL directly to database
 */

import postgres from "postgres";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";

// Load env vars
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "../.env.local") });

const sql = postgres(process.env.DATABASE_URL, { max: 1 });

console.log("🚀 Applying migration SQL directly...\n");

try {
  const migrationSQL = readFileSync(
    join(
      __dirname,
      "../packages/database/drizzle/0001_incremental_migration.sql",
    ),
    "utf-8",
  );

  // Execute the migration
  await sql.unsafe(migrationSQL);

  console.log("✅ Migration applied successfully!\n");
} catch (error) {
  console.error("❌ Migration failed:", error.message);
  process.exit(1);
} finally {
  await sql.end();
}
