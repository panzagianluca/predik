import { MarketCard } from "@/components/market/MarketCard";
import { Market } from "@/types/market";
import { GlowingButton } from "@/components/ui/glowing-button";
import { HomeBackgroundWrapper } from "@/components/layout/HomeBackgroundWrapper";
import { Features } from "@/components/home/Features";
import { Hero } from "@/components/home/Hero";
import { FadeIn } from "@/components/animations/FadeIn";

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
        <Hero />

        {/* Content Sections with transparent background */}
        <div className="relative z-20">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm [mask-image:linear-gradient(to_bottom,transparent,black_35rem)] -z-10" />

          {/* Featured Markets Section (Moved to top) */}
          {markets.length > 0 && (
            <div className="py-24 px-4 max-w-7xl mx-auto">
              <FadeIn>
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-5xl font-bold mb-4">
                    Mercados en Tendencia
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    Explora lo que está pasando ahora mismo en la región
                  </p>
                </div>
              </FadeIn>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {markets.map((market, index) => (
                  <FadeIn key={market.id} delay={index * 0.1}>
                    <MarketCard market={market} />
                  </FadeIn>
                ))}
              </div>

              <FadeIn delay={0.1}>
                <div className="flex justify-center mt-16">
                  <GlowingButton href="https://app.predik.io/markets">
                    {["Ver Todos", "los Mercados"]}
                  </GlowingButton>
                </div>
              </FadeIn>
            </div>
          )}

          {/* Features Section */}
          <Features />
        </div>
      </div>
    </>
  );
}
