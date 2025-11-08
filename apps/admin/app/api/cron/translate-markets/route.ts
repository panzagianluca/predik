import { NextResponse } from "next/server";
import { db, marketTranslations } from "@predik/database";
import { eq } from "drizzle-orm";

const MYRIAD_API_URL =
  process.env.NEXT_PUBLIC_MYRIAD_API_URL || "https://api-v2.myriadprotocol.com";
const MYRIAD_API_KEY = process.env.MYRIAD_API_KEY!;
const DEEPL_API_KEY = process.env.DEEPL_API_KEY!;

/**
 * Daily cron job to translate new markets from Myriad to Spanish
 * Runs every day at 3 AM UTC (configured in vercel.json)
 * Translates only NEW markets that don't have translations yet
 */
export async function GET(request: Request) {
  try {
    // Verify this is called by Vercel Cron (security check)
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🌐 Starting daily market translation cron job...");

    // Fetch ALL open markets from Myriad (these are the active ones users will see)
    const response = await fetch(
      `${MYRIAD_API_URL}/markets?${new URLSearchParams({
        network_id: "56", // BNB
        token_address:
          process.env.NEXT_PUBLIC_USDT_TOKEN_ADDRESS ||
          "0x55d398326f99059fF775485246999027B3197955",
        state: "open", // Only translate open markets
        limit: "100", // Translate up to 100 markets per run
      })}`,
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": MYRIAD_API_KEY,
        },
      },
    );

    if (!response.ok) {
      console.error(
        "Failed to fetch markets from Myriad:",
        response.statusText,
      );
      return NextResponse.json(
        { error: "Failed to fetch markets" },
        { status: 500 },
      );
    }

    const responseData = await response.json();
    const markets = responseData.data || responseData;

    console.log(`📊 Found ${markets.length} open markets to check`);

    let translated = 0;
    let skipped = 0;
    let errors = 0;

    // Process markets sequentially to avoid rate limits
    for (const market of markets) {
      try {
        // Check if translation already exists
        const existing = await db
          .select()
          .from(marketTranslations)
          .where(eq(marketTranslations.market_id, market.id))
          .limit(1);

        if (existing.length > 0) {
          skipped++;
          continue;
        }

        // Translate the new market
        console.log(`🆕 Translating new market: "${market.title}"`);

        const { titleEs, descriptionEs } = await translateMarketToSpanish({
          title: market.title,
          description: market.description,
        });

        // Store in database
        await db.insert(marketTranslations).values({
          market_id: market.id,
          market_slug: market.slug,
          title_es: titleEs,
          description_es: descriptionEs,
          title_en: market.title,
          description_en: market.description,
        });

        translated++;
        console.log(`✅ Translated: "${titleEs}"`);

        // Rate limit: wait 100ms between translations to be nice to DeepL API
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error translating market ${market.id}:`, error);
        errors++;
        // Continue with next market even if one fails
      }
    }

    const summary = {
      success: true,
      total: markets.length,
      translated,
      skipped,
      errors,
      timestamp: new Date().toISOString(),
    };

    console.log("🎉 Translation cron job completed:", summary);

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error in translation cron job:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * Translate market data to Spanish using DeepL API
 */
async function translateMarketToSpanish({
  title,
  description,
}: {
  title: string;
  description: string;
}): Promise<{ titleEs: string; descriptionEs: string }> {
  const response = await fetch("https://api-free.deepl.com/v2/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
    },
    body: new URLSearchParams({
      text: [title, description].join("\n\n"),
      target_lang: "ES",
      source_lang: "EN",
      formality: "default",
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepL API error: ${response.statusText}`);
  }

  const data = await response.json();
  const translations = data.translations.map((t: any) => t.text);

  return {
    titleEs: translations[0],
    descriptionEs: translations[1],
  };
}
