"use client";

import { Market } from "@/types/market";
import { Calendar, TrendingUp } from "lucide-react";
import Image from "next/image";
import { translateOutcomeTitle } from "@/lib/translation/outcomeTranslations";

interface MarketCardProps {
  market: Market;
}

export function MarketCard({ market }: MarketCardProps) {
  // Format date to relative (e.g., "58 days")
  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);

    // Check if year is 2099 or beyond (open-ended markets)
    if (date.getFullYear() >= 2099) return "Abierto";

    const nowInArgentina = new Date(
      new Date().toLocaleString("en-US", {
        timeZone: "America/Argentina/Buenos_Aires",
      }),
    );

    const dateInArgentina = new Date(
      date.toLocaleString("en-US", {
        timeZone: "America/Argentina/Buenos_Aires",
      }),
    );

    const diffTime = dateInArgentina.getTime() - nowInArgentina.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Cerrado";
    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Mañana";

    return `${diffDays} días`;
  };

  // Format volume with K/M suffix
  const formatVolume = (volume?: number) => {
    if (!volume) return "$0.00";
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(2)}M`;
    }
    if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(2)}K`;
    }
    return `$${volume.toFixed(2)}`;
  };

  // Get outcome color
  const getOutcomeColor = (index: number, totalOutcomes: number) => {
    // For 2 outcomes: use green/red
    if (totalOutcomes <= 2) {
      return index === 0 ? "#22c55e" : "#ef4444";
    }

    // For 3+ outcomes: use diverse color palette
    const colorPalette = [
      "#22c55e", // Green
      "#3b82f6", // Blue
      "#f59e0b", // Amber
      "#ef4444", // Red
      "#8b5cf6", // Purple
      "#ec4899", // Pink
      "#14b8a6", // Teal
      "#f97316", // Orange
    ];

    return colorPalette[index % colorPalette.length];
  };

  return (
    <a
      href={`https://app.predik.io/markets/${market.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full rounded-xl overflow-hidden transition-all duration-200 ease-in-out bg-card/90 backdrop-blur-md border border-border hover:shadow-lg hover:-translate-y-1"
    >
      {/* Header Section */}
      <div className="p-4 pb-3">
        <div className="flex items-start gap-3">
          {/* Market Image */}
          {market.imageUrl && (
            <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
              <Image
                src={market.imageUrl}
                alt={market.title}
                fill
                sizes="48px"
                className="object-cover"
                loading="lazy"
              />
            </div>
          )}

          {/* Market Title */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold leading-tight line-clamp-2 hover:text-primary transition-colors duration-200">
              {market.titleEs || market.title}
            </h3>
          </div>
        </div>
      </div>

      {/* Outcomes Section */}
      <div className="px-4 pb-4">
        <div className="space-y-2">
          {market.outcomes.slice(0, 2).map((outcome, index) => {
            const probability = outcome.price * 100;
            const outcomeColor = getOutcomeColor(index, market.outcomes.length);

            return (
              <div key={outcome.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium truncate">
                    {translateOutcomeTitle(outcome.title)}
                  </span>
                  <span
                    className="font-bold ml-2"
                    style={{ color: outcomeColor }}
                  >
                    {probability.toFixed(2)}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      backgroundColor: outcomeColor,
                      width: `${probability}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border mt-4">
          {/* Close Date */}
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formatRelativeDate(market.expiresAt)}</span>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>{formatVolume(market.volume)}</span>
          </div>

          {/* BNB Network Badge */}
          <div className="flex items-center">
            <div className="relative w-3.5 h-3.5 flex items-center justify-center">
              <Image
                src="/bnb-seeklogo.svg"
                alt="BNB"
                fill
                sizes="14px"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}
