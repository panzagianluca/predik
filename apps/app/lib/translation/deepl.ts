import { logger } from "@/lib/logger";

/**
 * Translation Service - DeepL with Google Translate fallback
 * Translates text from English to Spanish using DeepL API
 * Falls back to Google Translate if DeepL quota is exceeded
 */

interface DeepLResponse {
  translations: Array<{
    detected_source_language: string;
    text: string;
  }>;
}

/**
 * Translate using Google Translate (free, no API key)
 */
async function translateWithGoogle(text: string): Promise<string> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=${encodeURIComponent(
      text,
    )}`;
    const response = await fetch(url);

    if (!response.ok) {
      logger.error("Google Translate error:", response.status);
      return text;
    }

    const data = await response.json();
    const translated = data[0].map((item: any) => item[0]).join("");
    return translated;
  } catch (error) {
    logger.error("Google Translate error:", error);
    return text;
  }
}

/**
 * Translate a single text from English to Spanish using DeepL with Google fallback
 */
export async function translateToSpanish(text: string): Promise<string> {
  // Try DeepL first if API key is configured
  if (process.env.DEEPL_API_KEY) {
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

      // Check for quota exceeded (HTTP 456)
      if (response.status === 456) {
        logger.warn(
          "⚠️ DeepL quota exceeded - falling back to Google Translate",
        );
        return await translateWithGoogle(text);
      }

      if (!response.ok) {
        const error = await response.text();
        logger.error("DeepL API error:", response.status, error);
        logger.warn("Falling back to Google Translate");
        return await translateWithGoogle(text);
      }

      const data: DeepLResponse = await response.json();
      return data.translations[0].text;
    } catch (error) {
      logger.error("DeepL error - falling back to Google:", error);
      return await translateWithGoogle(text);
    }
  }

  // No DeepL API key - use Google directly
  logger.log("No DeepL API key - using Google Translate");
  return await translateWithGoogle(text);
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
