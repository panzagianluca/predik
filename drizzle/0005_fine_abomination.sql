CREATE TABLE "saved_markets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_address" varchar(42) NOT NULL,
	"market_id" integer NOT NULL,
	"market_slug" text NOT NULL,
	"saved_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "saved_markets_user_market_unique" UNIQUE("user_address","market_id")
);
--> statement-breakpoint
CREATE INDEX "saved_markets_user_address_idx" ON "saved_markets" USING btree ("user_address");--> statement-breakpoint
CREATE INDEX "saved_markets_saved_at_idx" ON "saved_markets" USING btree ("saved_at");
