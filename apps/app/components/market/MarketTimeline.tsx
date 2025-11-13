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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const winningOutcome = market.outcomes.find(
    (o) => o.id === market.resolvedOutcomeId || o.price === 1,
  );

  const timelineEvents = [
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
      date: market.expiresAt, // Use expiresAt as resolved date fallback
      completed: true,
      color: "text-cyan-500",
    });
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[14px] font-semibold">Timeline</h3>
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

        {isExpanded && (
          <div className="space-y-0">
            {timelineEvents.map((event, index) => {
              const Icon = event.icon;
              const isLast = index === timelineEvents.length - 1;
              const isResolvedEvent = event.label === "Resuelto";

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
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(event.date)}
                    </p>
                    {isResolvedEvent && winningOutcome && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                        <Trophy className="h-3.5 w-3.5" />
                        <span className="text-xs font-semibold">
                          {translateOutcomeTitle(winningOutcome.title)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
