"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { logger } from "@/lib/logger";
import { fetchMarket } from "@/lib/myriad/api";
import { Market } from "@/types/market";
import { ProbabilityChart } from "@/components/market/ProbabilityChart";
import { TradingPanel } from "@/components/market/TradingPanel";
import { MobileTradingModal } from "@/components/market/MobileTradingModal";
import { RelatedMarketCard } from "@/components/market/RelatedMarketCard";
import { ShareButton } from "@/components/market/ShareButton";
import { ShareableMarketCard } from "@/components/market/ShareableMarketCard";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@/components/animate-ui/components/radix/tabs";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/animate-ui/components/radix/toggle-group";
import { MarketDetailSkeleton } from "@/components/ui/skeletons/MarketDetailSkeleton";
import { CommentSection } from "@/components/market/comments/CommentSection";
import { HoldersList } from "@/components/market/HoldersList";
import { ActivityList } from "@/components/market/ActivityList";
import { useAccount } from "wagmi";
import Image from "next/image";
import {
  Calendar,
  TrendingUp,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/animate-ui/primitives/animate/tooltip";
import CountUp from "react-countup";
import { haptics } from "@/lib/haptics";
import {
  translateStatus,
  translateTag,
} from "@/lib/translation/marketTranslations";
import { translateOutcomeTitle } from "@/lib/translation/outcomeTranslations";

// Helper function to format description with bold markdown
const formatDescription = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const boldText = part.slice(2, -2);
      return (
        <span key={index}>
          <br />
          <strong>{boldText}</strong>
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

export default function MarketDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { address, isConnected } = useAccount();

  const [market, setMarket] = useState<Market | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "24h" | "7d" | "30d" | "all"
  >("7d");
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [showMobileTrade, setShowMobileTrade] = useState(false);
  const [selectedOutcomeId, setSelectedOutcomeId] = useState<string | null>(
    null,
  );
  const [countdown, setCountdown] = useState<string>("");

  useEffect(() => {
    const loadMarket = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchMarket(slug);
        setMarket(data);
        logger.log("📊 Loaded market:", data);
      } catch (err) {
        logger.error("Failed to load market:", err);
        setError(err instanceof Error ? err.message : "Failed to load market");
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      loadMarket();
    }
  }, [slug]);

  // Countdown timer for markets closing in less than 24 hours
  useEffect(() => {
    if (!market) return;

    const updateCountdown = () => {
      const now = new Date();
      const expires = new Date(market.expiresAt);
      const diff = expires.getTime() - now.getTime();

      if (diff < 0) {
        setCountdown("");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      // Only show countdown if less than 24 hours
      if (hours < 24) {
        setCountdown(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}`,
        );
      } else {
        setCountdown("");
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [market]);

  const handleTradeComplete = async () => {
    // Reload market data after trade
    try {
      const data = await fetchMarket(slug);
      setMarket(data);
    } catch (err) {
      logger.error("Failed to reload market:", err);
    }
  };

  const handleMobileTradeOpen = (outcomeId: string) => {
    setSelectedOutcomeId(outcomeId);
    setShowMobileTrade(true);
    haptics.selection();
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate time remaining
  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff < 0) return "Cerrado";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} días`;
    if (hours > 0) return `${hours} horas`;
    return "Menos de 1 hora";
  };

  if (isLoading) {
    return <MarketDetailSkeleton />;
  }

  if (error || !market) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Market not found"}</p>
          <Link href="/" className="text-electric-purple hover:underline">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-12">
      {/* Container with same max-width as navbar - NO extra padding */}
      <div className="max-w-7xl mx-auto">
        {/* Banner Image (if available) - Full width */}
        {market.bannerUrl && (
          <div className="w-full h-48 rounded-xl overflow-hidden bg-gradient-to-br from-electric-purple/20 to-blue-500/20 my-6">
            <Image
              src={market.bannerUrl}
              alt={market.title}
              width={1200}
              height={192}
              className="w-full h-full object-cover"
              priority
            />
          </div>
        )}

        {/* Main Content: 2-Column Grid starts here */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_318px] gap-6 pt-6">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Market Title and Info - Now part of left column */}
            <div className="space-y-3">
              <div className="flex items-center md:items-start gap-3">
                {market.imageUrl && (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                    <Image
                      src={market.imageUrl}
                      alt={market.title}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-[20px] md:text-[24px] font-medium">
                      {market.titleEs || market.title}
                    </h1>

                    {/* Badges - Desktop only: Status | Tag | BNB Logo */}
                    <div className="hidden md:flex items-center gap-2 flex-wrap">
                      {/* State Badge */}
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-semibold uppercase flex items-center gap-1",
                          market.state === "open" &&
                            "bg-green-500/20 text-green-700 dark:text-green-400",
                          market.state === "closed" &&
                            "bg-orange-500/20 text-orange-700 dark:text-orange-400",
                          market.state === "resolved" &&
                            "bg-blue-500/20 text-blue-700 dark:text-blue-400",
                        )}
                      >
                        {market.state === "open" && (
                          <Clock className="h-3 w-3" />
                        )}
                        {market.state === "closed" && (
                          <XCircle className="h-3 w-3" />
                        )}
                        {market.state === "resolved" && (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        {translateStatus(market.state)}
                      </span>

                      {/* Topics/Tags - Only first one */}
                      {market.topics && market.topics.length > 0 && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
                          {translateTag(market.topics[0])}
                        </span>
                      )}

                      {/* BNB Chain Badge */}
                      <a
                        href={`https://bscscan.com/address/${market.tokenAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center hover:opacity-80 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          haptics.light();
                        }}
                      >
                        <div className="relative w-4 h-4 flex items-center justify-center">
                          <Image
                            src="/bnb-seeklogo.svg"
                            alt="BNB Chain"
                            fill
                            sizes="16px"
                            className="object-contain"
                          />
                        </div>
                      </a>
                    </div>
                  </div>

                  {/* Share Button - Desktop only */}
                  <div className="hidden md:block flex-shrink-0">
                    <ShareButton
                      marketId={market.id.toString()}
                      marketTitle={market.titleEs || market.title}
                      marketSlug={market.slug}
                    />
                  </div>
                </div>
              </div>

              {/* Badges - Mobile only, below image */}
              <div className="flex md:hidden items-center gap-2 flex-wrap justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* State Badge */}
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-[12px] font-semibold uppercase flex items-center gap-1",
                      market.state === "open" &&
                        "bg-green-500/20 text-green-700 dark:text-green-400",
                      market.state === "closed" &&
                        "bg-orange-500/20 text-orange-700 dark:text-orange-400",
                      market.state === "resolved" &&
                        "bg-blue-500/20 text-blue-700 dark:text-blue-400",
                    )}
                  >
                    {market.state === "open" && <Clock className="h-3 w-3" />}
                    {market.state === "closed" && (
                      <XCircle className="h-3 w-3" />
                    )}
                    {market.state === "resolved" && (
                      <CheckCircle2 className="h-3 w-3" />
                    )}
                    {translateStatus(market.state)}
                  </span>

                  {/* Topics/Tags - Only first one */}
                  {market.topics && market.topics.length > 0 && (
                    <span className="px-3 py-1 rounded-full text-[12px] font-semibold bg-muted text-muted-foreground">
                      {translateTag(market.topics[0])}
                    </span>
                  )}

                  {/* BNB Chain Badge */}
                  <a
                    href={`https://bscscan.com/address/${market.tokenAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:opacity-80 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      haptics.light();
                    }}
                  >
                    <div className="relative w-3.5 h-3.5 flex items-center justify-center">
                      <Image
                        src="/bnb-seeklogo.svg"
                        alt="BNB Chain"
                        fill
                        sizes="14px"
                        className="object-contain"
                      />
                    </div>
                  </a>
                </div>

                {/* Share Button - Mobile only */}
                <div className="flex-shrink-0">
                  <ShareButton
                    marketId={market.id.toString()}
                    marketTitle={market.titleEs || market.title}
                    marketSlug={market.slug}
                  />
                </div>
              </div>

              {/* Metadata Bar with Period Selector */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between text-sm text-muted-foreground gap-4">
                {/* Left side: Metadata grouped together */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {market.state === "open"
                        ? countdown
                          ? `Cierra en ${countdown}`
                          : `Cierra en ${getTimeRemaining(market.expiresAt)}`
                        : `Cerrado el ${formatDate(market.expiresAt)}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>
                      ${(market.volume || 0).toLocaleString()} volumen
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>
                      ${(market.liquidity || 0).toLocaleString()} liquidez
                    </span>
                  </div>
                </div>

                {/* Right side: Period Selector - ToggleGroup - Desktop only */}
                <div className="hidden md:flex items-center">
                  <ToggleGroup
                    type="single"
                    value={selectedTimeframe}
                    onValueChange={(value) => {
                      if (value) {
                        haptics.selection();
                        setSelectedTimeframe(
                          value as "24h" | "7d" | "30d" | "all",
                        );
                      }
                    }}
                    className="p-1 ml-2"
                  >
                    <ToggleGroupItem
                      value="24h"
                      aria-label="24 hours"
                      className="text-xs px-3 py-1 h-7"
                    >
                      24h
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="7d"
                      aria-label="7 days"
                      className="text-xs px-3 py-1 h-7"
                    >
                      7d
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="30d"
                      aria-label="30 days"
                      className="text-xs px-3 py-1 h-7"
                    >
                      30d
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="all"
                      aria-label="All time"
                      className="text-xs px-3 py-1 h-7"
                    >
                      Todo
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>
            </div>

            {/* Probability Chart */}
            <div className="space-y-4">
              {/* Chart - Full width, no card wrapper */}
              {market.outcomes && market.outcomes.length > 0 ? (
                <ProbabilityChart
                  outcomes={market.outcomes}
                  timeframe={selectedTimeframe}
                  className="h-[400px] w-full"
                />
              ) : (
                <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <p className="text-muted-foreground">
                    No hay datos del gráfico disponibles
                  </p>
                </div>
              )}

              {/* Period Selector - Mobile only, below chart */}
              <div className="flex md:hidden items-center justify-center">
                <ToggleGroup
                  type="single"
                  value={selectedTimeframe}
                  onValueChange={(value) => {
                    if (value) {
                      haptics.selection();
                      setSelectedTimeframe(
                        value as "24h" | "7d" | "30d" | "all",
                      );
                    }
                  }}
                  className="p-1"
                >
                  <ToggleGroupItem
                    value="24h"
                    aria-label="24 hours"
                    className="text-xs px-3 py-1 h-7"
                  >
                    24h
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="7d"
                    aria-label="7 days"
                    className="text-xs px-3 py-1 h-7"
                  >
                    7d
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="30d"
                    aria-label="30 days"
                    className="text-xs px-3 py-1 h-7"
                  >
                    30d
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="all"
                    aria-label="All time"
                    className="text-xs px-3 py-1 h-7"
                  >
                    Todo
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>

            {/* Description Section */}
            <div className="border-t border-b border-border py-6 space-y-4">
              {/* Expandable Description Section */}
              <div>
                <button
                  onClick={() => setShowMoreDetails(!showMoreDetails)}
                  className="flex items-center gap-2 text-sm font-semibold text-electric-purple hover:underline transition-colors"
                >
                  {showMoreDetails ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Ocultar descripción
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Ver descripción
                    </>
                  )}
                </button>

                <div
                  className={cn(
                    "overflow-hidden transition-all duration-500 ease-in-out",
                    showMoreDetails
                      ? "max-h-[2000px] opacity-100 mt-4"
                      : "max-h-0 opacity-0",
                  )}
                >
                  <div className="space-y-4">
                    {/* Full Description */}
                    {(market.descriptionEs || market.description) && (
                      <div>
                        <div className="text-sm text-foreground prose prose-sm max-w-none dark:prose-invert">
                          <ReactMarkdown
                            components={{
                              h1: ({ node, ...props }) => (
                                <h1
                                  className="text-lg font-bold mt-4 mb-2"
                                  {...props}
                                />
                              ),
                              h2: ({ node, ...props }) => (
                                <h2
                                  className="text-base font-bold mt-3 mb-2"
                                  {...props}
                                />
                              ),
                              h3: ({ node, ...props }) => (
                                <h3
                                  className="text-sm font-semibold mt-2 mb-1"
                                  {...props}
                                />
                              ),
                              p: ({ node, ...props }) => (
                                <p className="mb-2" {...props} />
                              ),
                              ul: ({ node, ...props }) => (
                                <ul
                                  className="list-disc ml-4 mb-2 space-y-1"
                                  {...props}
                                />
                              ),
                              ol: ({ node, ...props }) => (
                                <ol
                                  className="list-decimal ml-4 mb-2 space-y-1"
                                  {...props}
                                />
                              ),
                              li: ({ node, ...props }) => (
                                <li className="ml-2" {...props} />
                              ),
                              a: ({ node, ...props }) => (
                                <a
                                  className="text-electric-purple hover:underline"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  {...props}
                                />
                              ),
                              strong: ({ node, ...props }) => (
                                <strong className="font-bold" {...props} />
                              ),
                            }}
                          >
                            {(() => {
                              let desc =
                                market.descriptionEs || market.description;

                              // Convert broken bold patterns at start of lines to H2 headers
                              // Patterns like: **Fechas de mercado OR Fechas de mercado**: OR **Fechas de mercado**:
                              desc = desc.replace(
                                /^\*\*([^\*\n:]+)(\*\*)?:?\s*$/gm,
                                "## $1",
                              );

                              // Fix remaining broken bold markdown - lines ending with ** but no opening
                              desc = desc.replace(
                                /^([^\*\n]+)\*\*:?\s*$/gm,
                                "**$1**",
                              );

                              // Fix mid-line broken bold (word**: -> **word**)
                              desc = desc.replace(/(\w+)\*\*:/g, "**$1**:");

                              return desc;
                            })()}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}

                    {/* Resolution Source */}
                    {market.resolutionSource && (
                      <div>
                        <h3 className="font-semibold mb-2">
                          Fuente de Resolución
                        </h3>
                        <a
                          href={market.resolutionSource}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-electric-purple hover:underline flex items-center gap-1"
                        >
                          {market.resolutionTitle || market.resolutionSource}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}

                    {/* Market Details */}
                    <div>
                      <h3 className="font-semibold mb-2">
                        Detalles del Mercado
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Creado:</span>
                          <p className="font-medium">
                            {formatDate(market.createdAt || market.publishedAt)}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Cierra:</span>
                          <p className="font-medium">
                            {formatDate(market.expiresAt)}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Token:</span>
                          <p className="font-medium">
                            {market.token?.symbol || "N/A"}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Fee:</span>
                          <p className="font-medium">
                            {((market.fees?.buy?.fee || 0) * 100).toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Market Stats - Mobile Only (shown before tabs) */}
            <Card className="lg:hidden">
              <CardContent className="p-4 space-y-4">
                <h3 className="text-[14px] font-semibold">Estadísticas</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Liquidez
                    </span>
                    <span className="font-semibold">
                      $
                      <CountUp
                        end={market.liquidity}
                        duration={1}
                        separator=","
                        preserveValue
                      />
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Volumen
                    </span>
                    <span className="font-semibold">
                      $
                      <CountUp
                        end={market.volume || 0}
                        duration={1}
                        separator=","
                        preserveValue
                      />
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Operadores
                    </span>
                    <span className="font-semibold">
                      <CountUp
                        end={market.users || 0}
                        duration={0.8}
                        preserveValue
                      />
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Fee</span>
                    <span className="font-semibold">
                      {((market.fees?.buy?.fee || 0) * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Treasury Fee
                    </span>
                    <span className="font-semibold">
                      {((market.fees?.buy?.treasury_fee || 0) * 100).toFixed(2)}
                      %
                    </span>
                  </div>
                </div>

                {/* Current Outcomes */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-semibold text-sm mb-3">
                    Probabilidades Actuales
                  </h4>
                  <div className="space-y-2">
                    {market.outcomes.map((outcome, index) => (
                      <div
                        key={outcome.id}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm">
                          {translateOutcomeTitle(outcome.title)}
                        </span>
                        <span
                          className="font-bold"
                          style={{ color: index === 0 ? "#22c55e" : "#ef4444" }}
                        >
                          <CountUp
                            end={outcome.price * 100}
                            duration={0.8}
                            decimals={2}
                            suffix="%"
                            preserveValue
                          />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs: Comments | Holders | Activity */}
            <Tabs defaultValue="comments" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger
                  value="comments"
                  onClick={() => haptics.selection()}
                >
                  Comentarios
                </TabsTrigger>
                <TabsTrigger
                  value="holders"
                  onClick={() => haptics.selection()}
                >
                  Holders
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  onClick={() => haptics.selection()}
                >
                  Actividad
                </TabsTrigger>
              </TabsList>

              <TabsContents
                transition={{ duration: 0.3, ease: "easeInOut" }}
                style={{ overflow: "visible" }}
              >
                {/* Comments Tab */}
                <TabsContent value="comments" className="mt-4 overflow-visible">
                  <CommentSection
                    marketId={market.slug}
                    userAddress={address}
                  />
                </TabsContent>

                {/* Holders Tab */}
                <TabsContent value="holders" className="mt-4">
                  <HoldersList marketSlug={market.slug} />
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity" className="mt-4">
                  <ActivityList marketSlug={market.slug} />
                </TabsContent>
              </TabsContents>
            </Tabs>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Trading Panel - Desktop Only */}
            <div className="hidden lg:block">
              <TooltipProvider>
                <TradingPanel
                  market={market}
                  userAddress={address}
                  isConnected={isConnected}
                  onTradeComplete={handleTradeComplete}
                />
              </TooltipProvider>
            </div>

            {/* Market Stats - Desktop Only */}
            <Card className="hidden lg:block">
              <CardContent className="p-4 space-y-4">
                <h3 className="text-[14px] font-semibold">Estadísticas</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Liquidez
                    </span>
                    <span className="font-semibold">
                      $
                      <CountUp
                        end={market.liquidity}
                        duration={1}
                        separator=","
                        preserveValue
                      />
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Volumen
                    </span>
                    <span className="font-semibold">
                      $
                      <CountUp
                        end={market.volume || 0}
                        duration={1}
                        separator=","
                        preserveValue
                      />
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Operadores
                    </span>
                    <span className="font-semibold">
                      <CountUp
                        end={market.users || 0}
                        duration={0.8}
                        preserveValue
                      />
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Fee</span>
                    <span className="font-semibold">
                      {((market.fees?.buy?.fee || 0) * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Treasury Fee
                    </span>
                    <span className="font-semibold">
                      {((market.fees?.buy?.treasury_fee || 0) * 100).toFixed(2)}
                      %
                    </span>
                  </div>
                </div>

                {/* Current Outcomes */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-semibold text-sm mb-3">
                    Probabilidades Actuales
                  </h4>
                  <div className="space-y-2">
                    {market.outcomes.map((outcome, index) => (
                      <div
                        key={outcome.id}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm">
                          {translateOutcomeTitle(outcome.title)}
                        </span>
                        <span
                          className="font-bold"
                          style={{ color: index === 0 ? "#22c55e" : "#ef4444" }}
                        >
                          <CountUp
                            end={outcome.price * 100}
                            duration={0.8}
                            decimals={2}
                            suffix="%"
                            preserveValue
                          />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Markets */}
            {market.relatedMarkets && market.relatedMarkets.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-[14px] font-semibold">
                  Mercados Relacionados
                </h3>
                <div className="space-y-3">
                  {market.relatedMarkets.slice(0, 3).map((relatedMarket) => (
                    <RelatedMarketCard
                      key={relatedMarket.id}
                      market={relatedMarket}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Trading Modal */}
      <MobileTradingModal
        isOpen={showMobileTrade}
        onClose={() => setShowMobileTrade(false)}
        market={market}
        preselectedOutcomeId={selectedOutcomeId || undefined}
        userAddress={address}
        isConnected={isConnected}
        onTradeComplete={handleTradeComplete}
      />

      {/* Mobile Fixed Bottom Action Bar */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border z-40">
        <div className="flex gap-2 max-w-7xl mx-auto">
          {market.outcomes.map((outcome, index) => (
            <button
              key={outcome.id}
              onClick={() => handleMobileTradeOpen(String(outcome.id))}
              className={cn(
                "flex-1 h-12 rounded-lg font-semibold text-sm transition-all duration-200 flex flex-col items-center justify-center",
                index === 0
                  ? "bg-green-600/75 hover:bg-green-700/75 text-white"
                  : "bg-red-600/75 hover:bg-red-700/75 text-white",
              )}
            >
              <span>{translateOutcomeTitle(outcome.title)}</span>
              <span className="text-xs opacity-90">
                {(outcome.price * 100).toFixed(1)}%
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Hidden Shareable Market Card for Image Generation */}
      <ShareableMarketCard
        marketId={market.id.toString()}
        title={market.titleEs || market.title}
        outcomes={market.outcomes}
        imageUrl={market.imageUrl}
        lastUpdated={new Date()}
      />
    </div>
  );
}
