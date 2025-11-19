import { MarketCard } from "@/components/market/MarketCard";
import { Market } from "@/types/market";
import { GlowingButton } from "@/components/ui/glowing-button";
import { HomeBackgroundWrapper } from "@/components/layout/HomeBackgroundWrapper";

// Force dynamic rendering to avoid build-time API calls that can timeout
export const dynamic = "force-dynamic";

async function getFeaturedMarkets(): Promise<Market[]> {
  try {
    const response = await fetch(
      "https://app.predik.io/api/markets?state=open&sort=volume&limit=4",
      {
        next: { revalidate: 60 }, // Revalidate every 60 seconds
      },
    );

    if (!response.ok) {
      console.error("Failed to fetch markets");
      return [];
    }

    const markets = await response.json();
    return markets.slice(0, 4);
  } catch (error) {
    console.error("Error fetching markets:", error);
    return [];
  }
}

export default async function Home() {
  const markets = await getFeaturedMarkets();

  return (
    <>
      {/* Override layout background with animated version for homepage only */}
      <HomeBackgroundWrapper />

      <div className="min-h-screen">
        {/* Hero Section - Text floats on top of gradient */}
        <div className="flex flex-col items-center gap-8 py-24 text-center px-4">
          <h1 className="text-6xl font-bold text-foreground drop-shadow-lg">
            El futuro tiene precio
          </h1>
          <p className="text-2xl text-foreground/90 drop-shadow-md">
            Predecí en política, dólar, deportes y más
          </p>
          <div className="flex gap-4 mt-8">
            <GlowingButton href="https://app.predik.io">
              {["Comenzar", "a Predecir"]}
            </GlowingButton>
          </div>
        </div>

        {/* Markets Section - With white background */}
        <div className="bg-background relative z-20">
          <div className="max-w-7xl mx-auto px-4">
            {/* Featured Markets Section */}
            {markets.length > 0 && (
              <div className="pb-16">
                <h2 className="text-3xl font-bold text-center mb-8">
                  Mercados Destacados
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {markets.map((market) => (
                    <MarketCard key={market.id} market={market} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
