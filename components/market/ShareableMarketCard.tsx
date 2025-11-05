"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ProbabilityChart } from "./ProbabilityChart";
import { translateOutcomeTitle } from "@/lib/translation/outcomeTranslations";
import { Outcome } from "@/types/market";

interface ShareableMarketCardProps {
  marketId: string;
  title: string;
  outcomes: Outcome[];
}

/**
 * Hidden card component used for generating shareable images
 * Fixed 1200x1200px square format - optimal for Instagram, WhatsApp, Stories
 * Theme-aware: uses share-background-dark.png or share-background-light.png
 */
export function ShareableMarketCard({
  marketId,
  title,
  outcomes,
}: ShareableMarketCardProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use resolvedTheme to handle 'system' theme
  const currentTheme = mounted ? resolvedTheme || theme : "dark";
  const backgroundImage =
    currentTheme === "dark"
      ? "/share-background-dark.png"
      : "/share-background-light.png";

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div
      data-share-card={marketId}
      className="fixed -left-[9999px] -top-[9999px] pointer-events-none"
      style={{ zIndex: -9999 }}
    >
      <div className="relative w-[1200px] h-[1200px] overflow-hidden">
        {/* Background Image Layer - Theme Aware */}
        <Image
          src={backgroundImage}
          alt="Share background"
          fill
          className="object-cover"
          priority
          unoptimized // Don't optimize for share images
        />

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-16">
          {/* Top: Market Question */}
          <div className="text-center px-8 pt-8">
            <h1
              className="text-6xl font-bold text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] leading-tight"
              style={{
                textShadow:
                  "0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)",
              }}
            >
              {title}
            </h1>
          </div>

          {/* Middle: Chart */}
          <div className="flex-1 flex items-center justify-center px-12 py-16">
            <div className="w-full h-[500px]">
              <ProbabilityChart
                outcomes={outcomes}
                timeframe="all"
                className="share-chart"
              />
            </div>
          </div>

          {/* Bottom: Outcome Legends */}
          <div className="flex justify-around px-8 pb-8">
            {outcomes.slice(0, 2).map((outcome) => (
              <div key={outcome.id} className="text-center">
                <div
                  className="text-3xl font-semibold text-white/90 mb-2"
                  style={{
                    textShadow:
                      "0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)",
                  }}
                >
                  {translateOutcomeTitle(outcome.title)}
                </div>
                <div
                  className="text-7xl font-bold text-white"
                  style={{
                    textShadow:
                      "0 2px 8px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.3)",
                  }}
                >
                  {Math.round(outcome.price * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
