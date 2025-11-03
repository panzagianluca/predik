CREATE TABLE "market_translations" (
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
--> statement-breakpoint
CREATE INDEX "market_translations_slug_idx" ON "market_translations" USING btree ("market_slug");--> statement-breakpoint
CREATE INDEX "market_translations_translated_at_idx" ON "market_translations" USING btree ("translated_at");
