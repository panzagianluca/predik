CREATE TABLE "admin_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_email" varchar(255) NOT NULL,
	"action_type" varchar(100) NOT NULL,
	"resource_type" varchar(100) NOT NULL,
	"resource_id" uuid,
	"details" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE "comment_reports" (
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
--> statement-breakpoint
CREATE TABLE "market_metadata" (
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
--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "user_address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "link" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "is_hidden" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "market_proposals" ADD COLUMN "related_market_slug" varchar(255);--> statement-breakpoint
ALTER TABLE "market_proposals" ADD COLUMN "myriad_market_id" varchar(255);--> statement-breakpoint
ALTER TABLE "market_proposals" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "expires_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "comment_reports" ADD CONSTRAINT "comment_reports_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_actions_admin_email_idx" ON "admin_actions" USING btree ("admin_email");--> statement-breakpoint
CREATE INDEX "admin_actions_action_type_idx" ON "admin_actions" USING btree ("action_type");--> statement-breakpoint
CREATE INDEX "admin_actions_created_at_idx" ON "admin_actions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "banned_users_address_idx" ON "banned_users" USING btree ("user_address");--> statement-breakpoint
CREATE INDEX "banned_users_expires_idx" ON "banned_users" USING btree ("ban_expires_at");--> statement-breakpoint
CREATE INDEX "comment_reports_comment_id_idx" ON "comment_reports" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX "comment_reports_status_idx" ON "comment_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "comment_reports_created_at_idx" ON "comment_reports" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "market_metadata_featured_idx" ON "market_metadata" USING btree ("is_featured","display_order");--> statement-breakpoint
CREATE INDEX "market_metadata_category_idx" ON "market_metadata" USING btree ("category");--> statement-breakpoint
CREATE INDEX "market_metadata_slug_idx" ON "market_metadata" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "comments_user_address_idx" ON "comments" USING btree ("user_address");--> statement-breakpoint
CREATE INDEX "comments_visible_idx" ON "comments" USING btree ("is_hidden");--> statement-breakpoint
CREATE INDEX "proposals_related_idx" ON "market_proposals" USING btree ("related_market_slug");--> statement-breakpoint
CREATE INDEX "notifications_type_idx" ON "notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "notifications_expires_at_idx" ON "notifications" USING btree ("expires_at");
