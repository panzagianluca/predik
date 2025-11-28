"use client";

import { useState } from "react";
import { Market } from "@/types/market";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Calendar,
  XCircle,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { translateOutcomeTitle } from "@/lib/translation/outcomeTranslations";

interface MarketTimelineProps {
  market: Market;
}

export function MarketTimeline({ market }: MarketTimelineProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const isIndefinite = new Date(market.expiresAt).getFullYear() >= 2099;

  const winningOutcome = market.outcomes.find(
    (o) => o.id === market.resolvedOutcomeId || o.price === 1,
  );

  // For indefinite markets, get the last trading date from price charts
  const getLastTradingDate = (): string | null => {
    if (!isIndefinite) return null;

    // Try to find the last price point from any outcome's "all" timeframe chart
    for (const outcome of market.outcomes) {
      const allChart =
        outcome.priceCharts?.find((c) => c.timeframe === "all") ||
        outcome.price_charts?.find((c) => c.timeframe === "all");
      if (allChart?.prices?.length) {
        const lastPoint = allChart.prices[allChart.prices.length - 1];
        return (
          lastPoint.date || new Date(lastPoint.timestamp * 1000).toISOString()
        );
      }
    }
    return null;
  };

  const lastTradingDate = getLastTradingDate();

  const formatDate = (
    dateString: string,
    isResolvedEvent: boolean = false,
    isClosedEvent: boolean = false,
  ) => {
    const date = new Date(dateString);

    // For indefinite markets (year >= 2099)
    if (date.getFullYear() >= 2099) {
      // For resolved indefinite markets, don't show date (winner shown separately)
      if (isResolvedEvent) {
        return null; // Will be hidden, winner label shown instead
      }
      // For closed indefinite markets, show last trading date if available
      if (isClosedEvent && lastTradingDate) {
        const tradingDate = new Date(lastTradingDate);
        return tradingDate.toLocaleDateString("es-AR", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
      if (isClosedEvent) {
        return "Se obtuvo el resultado";
      }
      return "Sin fecha definida";
    }

    return date.toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const timelineEvents: Array<{
    icon: typeof CheckCircle2;
    label: string;
    date: string;
    completed: boolean;
    color: string;
    winnerLabel?: string;
  }> = [
    {
      icon: CheckCircle2,
      label: "Mercado publicado",
      date: market.publishedAt || market.createdAt || market.expiresAt,
      completed: true,
      color: "text-blue-500",
    },
    {
      icon:
        market.state === "closed" || market.state === "resolved"
          ? XCircle
          : Calendar,
      label: market.state === "open" ? "Se cierra" : "Mercado cerrado",
      date: market.expiresAt,
      completed: market.state === "closed" || market.state === "resolved",
      color:
        market.state === "closed" || market.state === "resolved"
          ? "text-orange-500"
          : "text-muted-foreground",
    },
  ];

  if (market.state === "resolved") {
    timelineEvents.push({
      icon: Trophy,
      label: "Resuelto",
      date: market.expiresAt,
      completed: true,
      color: "text-cyan-500",
      winnerLabel: winningOutcome
        ? translateOutcomeTitle(winningOutcome.title)
        : undefined,
    });
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[14px] font-semibold">Línea de Tiempo</h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>

        <div
          className={cn(
            "overflow-hidden transition-all duration-500 ease-in-out",
            isExpanded
              ? "max-h-[2000px] opacity-100 mt-4"
              : "max-h-0 opacity-0 mt-0",
          )}
        >
          <div className="space-y-0">
            {timelineEvents.map((event, index) => {
              const Icon = event.icon;
              const isLast = index === timelineEvents.length - 1;
              const isResolvedEvent = event.label === "Resuelto";
              const isClosedEvent = event.label === "Mercado cerrado";

              return (
                <div key={index} className="flex gap-3">
                  {/* Icon and vertical line */}
                  <div className="flex flex-col items-center pt-1">
                    <Icon
                      className={cn(
                        "h-5 w-5 flex-shrink-0",
                        event.completed
                          ? event.color
                          : "text-muted-foreground/50",
                      )}
                    />
                    {!isLast && (
                      <div
                        className={cn(
                          "w-0.5 flex-1 my-1 min-h-[32px]",
                          event.completed
                            ? "bg-border"
                            : "bg-border/30 border-l-2 border-dashed border-muted-foreground/30",
                        )}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className={cn("flex-1", !isLast && "pb-6")}>
                    <p
                      className={cn(
                        "text-sm font-medium",
                        event.completed
                          ? "text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {event.label}
                    </p>
                    {(() => {
                      const dateText = formatDate(
                        event.date,
                        isResolvedEvent,
                        isClosedEvent,
                      );
                      // For resolved indefinite markets, only show winner (no date)
                      if (dateText === null && event.winnerLabel) {
                        return (
                          <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium mt-0.5">
                            Ganador: {event.winnerLabel}
                          </p>
                        );
                      }
                      return (
                        <>
                          {dateText && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {dateText}
                            </p>
                          )}
                          {event.winnerLabel && (
                            <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium mt-0.5">
                              Ganador: {event.winnerLabel}
                            </p>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
