-- Phase 3: Add banned_users table for progressive ban system

CREATE TABLE "banned_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_address" varchar(42) NOT NULL,
	"reason" text NOT NULL,
	"violation_count" integer DEFAULT 1 NOT NULL,
	"ban_expires_at" timestamp,
	"banned_by" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "banned_users_user_address_unique" UNIQUE("user_address")
);

CREATE INDEX "banned_users_address_idx" ON "banned_users" USING btree ("user_address");
CREATE INDEX "banned_users_expires_idx" ON "banned_users" USING btree ("ban_expires_at");
