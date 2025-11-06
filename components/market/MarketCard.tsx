"use client";

import { Market } from "@/types/market";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/animate-ui/components/animate/tooltip";
import { Calendar, TrendingUp, Droplet, Bookmark } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import CountUp from "react-countup";
import { haptics } from "@/lib/haptics";
import { translateOutcomeTitle } from "@/lib/translation/outcomeTranslations";
import { cn } from "@/lib/utils";
import { useAccount } from "wagmi";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import {
  trackMarketClick,
  trackOutcomeClick,
  trackMarketSave,
} from "@/lib/posthog";

interface MarketCardProps {
  market: Market;
}

export function MarketCard({ market }: MarketCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Show fade by default for markets with 3+ outcomes (hide when scrolled to bottom)
  const [isScrolling, setIsScrolling] = useState(true);

  // Initialize isSaved from localStorage immediately (synchronous)
  const [isSaved, setIsSaved] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("savedMarkets");
    if (saved) {
      try {
        const savedIds = JSON.parse(saved);
        return savedIds.includes(market.id);
      } catch {
        return false;
      }
    }
    return false;
  });

  const { address } = useAccount();
  const { setShowAuthFlow } = useDynamicContext();

  // Trigger animations on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Check if market is saved
  useEffect(() => {
    if (!address) {
      setIsSaved(false);
      return;
    }

    const fetchSavedMarkets = async () => {
      try {
        const response = await fetch(
          `/api/saved-markets?userAddress=${address}`,
        );
        if (response.ok) {
          const data = await response.json();
          setIsSaved(data.marketIds.includes(market.id));
        } else {
          // Fallback to localStorage if API fails
          const saved = localStorage.getItem("savedMarkets");
          if (saved) {
            const savedIds = JSON.parse(saved);
            setIsSaved(savedIds.includes(market.id));
          }
        }
      } catch (error) {
        // Fallback to localStorage on error
        const saved = localStorage.getItem("savedMarkets");
        if (saved) {
          const savedIds = JSON.parse(saved);
          setIsSaved(savedIds.includes(market.id));
        }
      }
    };

    fetchSavedMarkets();
  }, [market.id, address]);

  // Toggle save state
  const toggleSave = async (marketId: number) => {
    // Check if user is logged in
    if (!address) {
      setShowAuthFlow(true);
      return;
    }

    const newSavedState = !isSaved;
    setIsSaved(newSavedState);

    // Track save/unsave action
    trackMarketSave(marketId, market.slug, newSavedState);

    try {
      if (newSavedState) {
        // Save market
        await fetch("/api/saved-markets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userAddress: address,
            marketId,
            marketSlug: market.slug,
          }),
        });
      } else {
        // Remove saved market
        await fetch(
          `/api/saved-markets?userAddress=${address}&marketId=${marketId}`,
          {
            method: "DELETE",
          },
        );
      }

      // Also update localStorage as backup/cache
      const saved = localStorage.getItem("savedMarkets") || "[]";
      let savedIds = JSON.parse(saved);

      if (newSavedState) {
        if (!savedIds.includes(marketId)) {
          savedIds.push(marketId);
        }
      } else {
        savedIds = savedIds.filter((id: number) => id !== marketId);
      }

      localStorage.setItem("savedMarkets", JSON.stringify(savedIds));
    } catch (error) {
      console.error("Error toggling save:", error);
      // Revert UI state on error
      setIsSaved(!newSavedState);
    }
  };

  // Format date to relative (e.g., "58 days")
  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);

    // Check if year is 2099 or beyond (open-ended markets)
    if (date.getFullYear() >= 2099) return "Abierto";

    // Convert both dates to Argentina timezone for accurate comparison
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

    if (diffDays < 0) return "Closed";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";

    return `${diffDays} days`;
  };

  // Format absolute date for Argentina (e.g., "30 de noviembre, 2025")
  const formatAbsoluteDate = (dateString: string) => {
    const date = new Date(dateString);

    // Check if year is 2099 or beyond (open-ended markets)
    if (date.getFullYear() >= 2099) {
      return "Cuando una de las opciones sucede";
    }

    // Convert to Argentina timezone
    const argentinaDate = new Date(
      date.toLocaleString("en-US", {
        timeZone: "America/Argentina/Buenos_Aires",
      }),
    );

    const monthNames = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];

    return `${argentinaDate.getDate()} de ${
      monthNames[argentinaDate.getMonth()]
    }, ${argentinaDate.getFullYear()}`;
  }; // Format volume with K/M suffix
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

  // Format full volume for tooltip
  const formatFullVolume = (volume?: number) => {
    if (!volume) return "$0.00";
    return `$${volume.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Format liquidity with K/M suffix
  const formatLiquidity = (liquidity?: number) => {
    if (!liquidity) return "$0.00";
    if (liquidity >= 1000000) {
      return `$${(liquidity / 1000000).toFixed(2)}M`;
    }
    if (liquidity >= 1000) {
      return `$${(liquidity / 1000).toFixed(2)}K`;
    }
    return `$${liquidity.toFixed(2)}`;
  };

  // Format full liquidity for tooltip
  const formatFullLiquidity = (liquidity?: number) => {
    if (!liquidity) return "$0.00";
    return `$${liquidity.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Get outcome color
  const getOutcomeColor = (index: number, totalOutcomes: number) => {
    // For 2 outcomes: use green/red
    if (totalOutcomes <= 2) {
      return index === 0 ? "#22c55e" : "#ef4444"; // Green for first, Red for second
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

  // Check if market has multiple outcomes (3+)
  const hasMultipleOutcomes = market.outcomes.length > 2;

  return (
    <Card
      className="w-full md:max-w-[300px] rounded-xl overflow-hidden transition-all duration-200 ease-in-out"
      style={{
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: isHovered
          ? "0 10px 25px rgba(0, 0, 0, 0.1)"
          : "0 0 0 rgba(0, 0, 0, 0)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => haptics.light()}
    >
      {/* Header Section */}
      <CardHeader className="p-4 pb-3">
        <div className="flex items-start gap-3">
          {/* Market Image - V2 uses imageUrl */}
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

          {/* Market Title - Clickable */}
          <Link
            href={`/markets/${market.slug}`}
            className="flex-1 min-w-0"
            prefetch={true}
            onClick={() => {
              trackMarketClick(
                market.id,
                market.slug,
                market.titleEs || market.title,
                "market_card_title",
              );
            }}
          >
            <h3 className="text-base font-semibold leading-tight line-clamp-2 hover:text-primary transition-colors duration-200">
              {market.titleEs || market.title}
            </h3>
          </Link>
        </div>
      </CardHeader>

      {/* Outcomes Section - Fixed height container */}
      <CardContent className="px-4 pb-4">
        <div className="relative h-[76px] overflow-hidden">
          {/* Scrollable container for all outcomes */}
          <div
            className="space-y-2 h-full overflow-y-auto scrollbar-hide"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
            onScroll={(e) => {
              const target = e.currentTarget;
              const isAtBottom =
                target.scrollHeight - target.scrollTop <=
                target.clientHeight + 5;
              setIsScrolling(!isAtBottom);
            }}
          >
            {market.outcomes.map((outcome, index) => {
              const probability = outcome.price * 100;
              const outcomeColor = getOutcomeColor(
                index,
                market.outcomes.length,
              );

              return (
                <Link
                  key={outcome.id}
                  href={`/markets/${market.slug}?outcome=${outcome.id}`}
                  className="block group"
                  prefetch={true}
                  onClick={() => {
                    trackOutcomeClick(
                      market.id,
                      market.slug,
                      outcome.id,
                      outcome.title,
                      "market_card_outcome",
                    );
                  }}
                >
                  <div className="space-y-1 hover:opacity-80 transition-opacity duration-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {translateOutcomeTitle(outcome.title)}
                      </span>
                      <span
                        className="font-bold"
                        style={{ color: outcomeColor }}
                      >
                        <CountUp
                          start={probability > 10 ? probability - 5 : 0}
                          end={probability}
                          duration={0.8}
                          decimals={2}
                          suffix="%"
                          preserveValue
                        />
                      </span>
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden relative">
                      <motion.div
                        className="h-full rounded-full relative overflow-hidden"
                        style={{ backgroundColor: outcomeColor }}
                        initial={{ width: "0%" }}
                        animate={{
                          width: isVisible ? `${probability}%` : "0%",
                        }}
                        transition={{
                          duration: 0.2,
                          ease: "easeOut",
                          delay: 0.1,
                        }}
                      >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                      </motion.div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Gradient fade at bottom for 3+ outcomes - hidden when scrolled to bottom */}
          {hasMultipleOutcomes && isScrolling && (
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-card/60 to-transparent pointer-events-none transition-opacity duration-200" />
          )}
        </div>

        {/* Footer Metadata - Date | Volume | BNB, Save */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border mt-4 gap-1">
          {/* Close Date */}
          {/* Left: Date */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 hover:text-foreground transition-colors duration-200">
                <Calendar className="w-3 h-3" />
                <span>{formatRelativeDate(market.expiresAt)}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              Cierra: {formatAbsoluteDate(market.expiresAt)}
            </TooltipContent>
          </Tooltip>

          {/* Center: Volume */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center gap-1 flex-1 hover:text-foreground transition-colors duration-200">
                <TrendingUp className="w-3 h-3" />
                <span>{formatVolume(market.volume)}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              Volumen: {formatFullVolume(market.volume)}
            </TooltipContent>
          </Tooltip>

          {/* Right: BNB + Save */}
          <div className="flex items-center gap-2">
            {/* BNB Network Badge */}
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={`https://bscscan.com/address/${market.tokenAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:opacity-80 transition-opacity underline decoration-dotted"
                  onClick={(e) => {
                    e.stopPropagation();
                    haptics.light();
                  }}
                >
                  <div className="relative w-3.5 h-3.5 flex items-center justify-center">
                    <Image
                      src="/bnb-seeklogo.svg"
                      alt="BNB"
                      fill
                      sizes="14px"
                      className="object-contain"
                    />
                  </div>
                </a>
              </TooltipTrigger>
              <TooltipContent>Mercado en la red de BNB</TooltipContent>
            </Tooltip>

            {/* Save/Bookmark Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleSave(market.id);
                    haptics.selection();
                  }}
                  className="flex items-center hover:text-foreground transition-colors"
                >
                  <Bookmark
                    className={cn(
                      "w-3.5 h-3.5",
                      isSaved && "fill-electric-purple text-electric-purple",
                    )}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {isSaved ? "Guardado" : "Guardar mercado"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
