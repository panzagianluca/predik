import { logger } from "@/lib/logger";

/**
 * DeepL Translation Service
 * Translates text from English to Spanish using DeepL API
 */

interface DeepLResponse {
  translations: Array<{
    detected_source_language: string;
    text: string;
  }>;
}

/**
 * Translate a single text from English to Spanish using DeepL
 */
export async function translateToSpanish(text: string): Promise<string> {
  if (!process.env.DEEPL_API_KEY) {
    logger.error("DEEPL_API_KEY not configured - returning original text");
    return text; // Fallback to English if no API key
  }

  try {
    const response = await fetch("https://api-free.deepl.com/v2/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
      },
      body: new URLSearchParams({
        text: text,
        target_lang: "ES",
        source_lang: "EN",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      logger.error("DeepL API error:", response.status, error);
      return text; // Fallback to English on error
    }

    const data: DeepLResponse = await response.json();
    return data.translations[0].text;
  } catch (error) {
    logger.error("Error translating text:", error);
    return text; // Fallback to English on error
  }
}

/**
 * Translate market title and description to Spanish
 */
export async function translateMarketToSpanish(market: {
  title: string;
  description: string;
}): Promise<{ titleEs: string; descriptionEs: string }> {
  logger.log("🌐 Translating market to Spanish:", market.title);

  // Translate both fields in parallel for efficiency
  const [titleEs, descriptionEs] = await Promise.all([
    translateToSpanish(market.title),
    translateToSpanish(market.description),
  ]);

  logger.log("✅ Translation complete:", {
    original: market.title,
    translated: titleEs,
  });

  return { titleEs, descriptionEs };
}

/**
 * Batch translate multiple markets (used by cron job)
 */
export async function batchTranslateMarkets(
  markets: Array<{ title: string; description: string }>,
): Promise<Array<{ titleEs: string; descriptionEs: string }>> {
  logger.log(`🌐 Batch translating ${markets.length} markets...`);

  const results = await Promise.all(
    markets.map((market) => translateMarketToSpanish(market)),
  );

  logger.log(`✅ Batch translation complete: ${results.length} markets`);
  return results;
}
