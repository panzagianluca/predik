-- ============================================================================
-- INCREMENTAL MIGRATION: Preserve existing data, add new features
-- Generated: 2025-11-10
-- Description: Add Phase 2 features (moderation, featured markets, notifications expiry)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- STEP 1: ALTER EXISTING TABLES (add new columns)
-- ----------------------------------------------------------------------------

-- Comments: Add moderation flag
ALTER TABLE "comments" ADD COLUMN IF NOT EXISTS "is_hidden" boolean DEFAULT false NOT NULL;

-- Notifications: Add expiration tracking
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "expires_at" timestamp DEFAULT (now() + interval '30 days') NOT NULL;

-- Market Proposals: Link to created markets
ALTER TABLE "market_proposals" ADD COLUMN IF NOT EXISTS "related_market_slug" varchar(255);
ALTER TABLE "market_proposals" ADD COLUMN IF NOT EXISTS "myriad_market_id" varchar(255);

-- ----------------------------------------------------------------------------
-- STEP 2: CREATE NEW TABLES
-- ----------------------------------------------------------------------------

-- Market Metadata: Featured markets and translations
CREATE TABLE IF NOT EXISTS "market_metadata" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"myriad_id" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title_es" text,
	"description_es" text,
	"category" varchar(100),
	"is_featured" boolean DEFAULT false NOT NULL,
	"display_order" integer,
	"image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "market_metadata_myriad_id_unique" UNIQUE("myriad_id"),
	CONSTRAINT "market_metadata_slug_unique" UNIQUE("slug")
);

-- Comment Reports: User-driven moderation
CREATE TABLE IF NOT EXISTS "comment_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"comment_id" uuid NOT NULL,
	"reporter_address" varchar(42) NOT NULL,
	"reason" varchar(100) NOT NULL,
	"details" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"reviewed_by" varchar(255),
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "comment_reports_unique" UNIQUE("comment_id","reporter_address")
);

-- Admin Actions: Audit log for admin operations
CREATE TABLE IF NOT EXISTS "admin_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_email" varchar(255) NOT NULL,
	"action_type" varchar(100) NOT NULL,
	"resource_type" varchar(100) NOT NULL,
	"resource_id" uuid,
	"details" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Saved Markets: User favorites
CREATE TABLE IF NOT EXISTS "saved_markets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_address" varchar(42) NOT NULL,
	"market_id" integer NOT NULL,
	"market_slug" text NOT NULL,
	"saved_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "saved_markets_user_market_unique" UNIQUE("user_address","market_id")
);

-- Market Translations: Bilingual content (future use)
CREATE TABLE IF NOT EXISTS "market_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"market_id" integer NOT NULL,
	"market_slug" text NOT NULL,
	"title_es" text NOT NULL,
	"description_es" text NOT NULL,
	"title_en" text NOT NULL,
	"description_en" text NOT NULL,
	"translated_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "market_translations_market_id_unique" UNIQUE("market_id")
);

-- ----------------------------------------------------------------------------
-- STEP 3: ADD FOREIGN KEY CONSTRAINTS
-- ----------------------------------------------------------------------------

-- Comment Reports -> Comments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'comment_reports_comment_id_comments_id_fk'
  ) THEN
    ALTER TABLE "comment_reports" ADD CONSTRAINT "comment_reports_comment_id_comments_id_fk"
      FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;

-- Notifications -> Comments (optional reference)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'notifications_comment_id_comments_id_fk'
  ) THEN
    ALTER TABLE "notifications" ADD CONSTRAINT "notifications_comment_id_comments_id_fk"
      FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- STEP 4: CREATE INDEXES FOR PERFORMANCE
-- ----------------------------------------------------------------------------

-- Comments: visibility filter
CREATE INDEX IF NOT EXISTS "comments_visible_idx" ON "comments" USING btree ("is_hidden");

-- Notifications: expiration cleanup
CREATE INDEX IF NOT EXISTS "notifications_expires_at_idx" ON "notifications" USING btree ("expires_at");
CREATE INDEX IF NOT EXISTS "notifications_user_unread_idx" ON "notifications" USING btree ("user_address","is_read");

-- Market Proposals: related markets lookup
CREATE INDEX IF NOT EXISTS "proposals_related_idx" ON "market_proposals" USING btree ("related_market_slug");

-- Market Metadata: featured homepage query
CREATE INDEX IF NOT EXISTS "market_metadata_featured_idx" ON "market_metadata" USING btree ("is_featured","display_order");
CREATE INDEX IF NOT EXISTS "market_metadata_category_idx" ON "market_metadata" USING btree ("category");
CREATE INDEX IF NOT EXISTS "market_metadata_slug_idx" ON "market_metadata" USING btree ("slug");

-- Comment Reports: moderation queue
CREATE INDEX IF NOT EXISTS "comment_reports_comment_id_idx" ON "comment_reports" USING btree ("comment_id");
CREATE INDEX IF NOT EXISTS "comment_reports_status_idx" ON "comment_reports" USING btree ("status");
CREATE INDEX IF NOT EXISTS "comment_reports_created_at_idx" ON "comment_reports" USING btree ("created_at");

-- Admin Actions: audit log search
CREATE INDEX IF NOT EXISTS "admin_actions_admin_email_idx" ON "admin_actions" USING btree ("admin_email");
CREATE INDEX IF NOT EXISTS "admin_actions_action_type_idx" ON "admin_actions" USING btree ("action_type");
CREATE INDEX IF NOT EXISTS "admin_actions_created_at_idx" ON "admin_actions" USING btree ("created_at");

-- Saved Markets: user favorites lookup
CREATE INDEX IF NOT EXISTS "saved_markets_user_address_idx" ON "saved_markets" USING btree ("user_address");
CREATE INDEX IF NOT EXISTS "saved_markets_saved_at_idx" ON "saved_markets" USING btree ("saved_at");

-- Market Translations: bilingual search
CREATE INDEX IF NOT EXISTS "market_translations_slug_idx" ON "market_translations" USING btree ("market_slug");
CREATE INDEX IF NOT EXISTS "market_translations_translated_at_idx" ON "market_translations" USING btree ("translated_at");

-- ----------------------------------------------------------------------------
-- VERIFICATION QUERIES (run after migration to validate)
-- ----------------------------------------------------------------------------

-- Check that existing data is preserved
-- SELECT COUNT(*) as user_count FROM users;
-- SELECT COUNT(*) as proposal_count FROM market_proposals;
-- SELECT COUNT(*) as proposal_vote_count FROM proposal_votes;

-- Check new columns exist
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'is_hidden';
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'expires_at';
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'market_proposals' AND column_name = 'related_market_slug';

-- Check new tables exist
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('market_metadata', 'comment_reports', 'admin_actions', 'saved_markets', 'market_translations');
