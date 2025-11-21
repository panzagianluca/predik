"use client";

import { useState, useEffect } from "react";
import { MarketCard } from "@/components/market/MarketCard";
import { Market } from "@/types/market";
import { TrendingUp, Clock, Calendar, X, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/animate-ui/primitives/animate/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { haptics } from "@/lib/haptics";
import { useAccount } from "wagmi";
import { LogoSpinner } from "@/components/ui/logo-spinner";
import { logger } from "@/lib/logger";

type TimeFilter = "trending" | "recent" | "closing-soon" | "closed" | "saved";
type CategoryFilter =
  | "all"
  | "sports"
  | "economy"
  | "politics"
  | "crypto"
  | "culture"
  | "gaming";

interface MarketsGridProps {}

export function MarketsGrid() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("trending");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [savedMarketIds, setSavedMarketIds] = useState<number[]>([]);
  const [openMarkets, setOpenMarkets] = useState<Market[]>([]);
  const [closedMarkets, setClosedMarkets] = useState<Market[]>([]);
  const [isLoadingOpen, setIsLoadingOpen] = useState(true);
  const [isLoadingClosed, setIsLoadingClosed] = useState(false);
  const [hasLoadedClosed, setHasLoadedClosed] = useState(false);
  const [closedPage, setClosedPage] = useState(1);
  const [resolvedPage, setResolvedPage] = useState(1);
  const [hasMoreClosed, setHasMoreClosed] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { address } = useAccount();

  // Fetch open markets on mount
  useEffect(() => {
    const fetchOpenMarkets = async () => {
      setIsLoadingOpen(true);
      try {
        const response = await fetch(
          `/api/markets?state=open&sort=volume&order=desc&limit=100&page=1`,
        );
        if (response.ok) {
          const markets = await response.json();
          // Filter out test markets
          const filteredMarkets = markets.filter(
            (market: Market) =>
              !market.title.toLowerCase().includes("test usd") &&
              !market.slug.includes("test-usd") &&
              !market.title.toLowerCase().includes("bnb candles") &&
              !market.slug.includes("bnb-candles"),
          );
          setOpenMarkets(filteredMarkets);
          logger.log("✅ Loaded", filteredMarkets.length, "open markets");
        }
      } catch (error) {
        logger.error("Error loading open markets:", error);
      } finally {
        setIsLoadingOpen(false);
      }
    };

    fetchOpenMarkets();
  }, []);

  // Fetch closed/resolved markets only when user clicks "Cerrados" tab
  useEffect(() => {
    if (timeFilter === "closed" && !hasLoadedClosed) {
      const fetchClosedMarkets = async () => {
        setIsLoadingClosed(true);
        try {
          // Only fetch first 50 closed and 50 resolved (most recent/popular)
          const [closedResponse, resolvedResponse] = await Promise.all([
            fetch(
              `/api/markets?state=closed&sort=volume&order=desc&limit=50&page=1`,
            ),
            fetch(
              `/api/markets?state=resolved&sort=volume&order=desc&limit=50&page=1`,
            ),
          ]);

          const closed = closedResponse.ok ? await closedResponse.json() : [];
          const resolved = resolvedResponse.ok
            ? await resolvedResponse.json()
            : [];

          const allClosed = [...closed, ...resolved].filter(
            (market: Market) =>
              !market.title.toLowerCase().includes("test usd") &&
              !market.slug.includes("test-usd") &&
              !market.title.toLowerCase().includes("bnb candles") &&
              !market.slug.includes("bnb-candles"),
          );

          setClosedMarkets(allClosed);
          setHasLoadedClosed(true);
          setClosedPage(1);
          setResolvedPage(1);
          setHasMoreClosed(closed.length === 50 || resolved.length === 50);
          logger.log("✅ Loaded", allClosed.length, "closed markets");
        } catch (error) {
          logger.error("Error loading closed markets:", error);
        } finally {
          setIsLoadingClosed(false);
        }
      };

      fetchClosedMarkets();
    }
  }, [timeFilter, hasLoadedClosed]);

  // Load more closed markets on scroll
  const loadMoreClosedMarkets = async () => {
    if (isLoadingMore || !hasMoreClosed) return;

    setIsLoadingMore(true);
    try {
      const nextClosedPage = closedPage + 1;
      const nextResolvedPage = resolvedPage + 1;

      const [closedResponse, resolvedResponse] = await Promise.all([
        fetch(
          `/api/markets?state=closed&sort=volume&order=desc&limit=50&page=${nextClosedPage}`,
        ),
        fetch(
          `/api/markets?state=resolved&sort=volume&order=desc&limit=50&page=${nextResolvedPage}`,
        ),
      ]);

      const closed = closedResponse.ok ? await closedResponse.json() : [];
      const resolved = resolvedResponse.ok ? await resolvedResponse.json() : [];

      const newMarkets = [...closed, ...resolved].filter(
        (market: Market) =>
          !market.title.toLowerCase().includes("test usd") &&
          !market.slug.includes("test-usd") &&
          !market.title.toLowerCase().includes("bnb candles") &&
          !market.slug.includes("bnb-candles"),
      );

      if (newMarkets.length > 0) {
        setClosedMarkets((prev) => [...prev, ...newMarkets]);
        setClosedPage(nextClosedPage);
        setResolvedPage(nextResolvedPage);
        setHasMoreClosed(closed.length === 50 || resolved.length === 50);
        logger.log("✅ Loaded", newMarkets.length, "more closed markets");
      } else {
        setHasMoreClosed(false);
      }
    } catch (error) {
      logger.error("Error loading more closed markets:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Infinite scroll detection
  useEffect(() => {
    if (timeFilter !== "closed" || !hasLoadedClosed) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      // Load more when user is 500px from bottom
      if (
        scrollHeight - scrollTop - clientHeight < 500 &&
        hasMoreClosed &&
        !isLoadingMore
      ) {
        loadMoreClosedMarkets();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [
    timeFilter,
    hasLoadedClosed,
    hasMoreClosed,
    isLoadingMore,
    closedPage,
    resolvedPage,
  ]);

  // Fetch saved markets from API when user logs in or filter changes to "saved"
  useEffect(() => {
    const fetchSavedMarkets = async () => {
      if (!address) {
        setSavedMarketIds([]);
        return;
      }

      try {
        const response = await fetch(
          `/api/saved-markets?userAddress=${address}`,
        );
        if (response.ok) {
          const data = await response.json();
          setSavedMarketIds(data.marketIds);
        } else {
          // Fallback to localStorage
          const saved = localStorage.getItem("savedMarkets");
          if (saved) {
            setSavedMarketIds(JSON.parse(saved));
          }
        }
      } catch (error) {
        // Fallback to localStorage on error
        const saved = localStorage.getItem("savedMarkets");
        if (saved) {
          setSavedMarketIds(JSON.parse(saved));
        }
      }
    };

    if (timeFilter === "saved" || address) {
      fetchSavedMarkets();
    }
  }, [address, timeFilter]);

  // Combine markets based on current filter
  const allMarkets =
    timeFilter === "closed" ? [...openMarkets, ...closedMarkets] : openMarkets;

  // Filter markets based on selected filters
  const filteredMarkets = allMarkets.filter((market) => {
    // Time filter logic
    if (timeFilter === "saved") {
      // Show only saved markets
      if (!savedMarketIds.includes(market.id)) return false;
    } else if (timeFilter === "closed") {
      // Show only closed or resolved markets
      if (market.state !== "closed" && market.state !== "resolved")
        return false;
    } else {
      // For all other filters, only show open markets
      if (market.state !== "open") return false;
    }

    // Category filter - V2 uses topics array only (no category field)
    if (categoryFilter !== "all") {
      const categoryMap: Record<CategoryFilter, string[]> = {
        all: [],
        sports: ["Deportes", "Sports", "Deporte"],
        economy: ["Economía", "Economy", "Economia"],
        politics: ["Política", "Politics", "Politica"],
        crypto: ["Crypto", "Cryptocurrency"],
        culture: ["Cultura", "Culture"],
        gaming: ["Gaming"],
      };

      const allowedCategories = categoryMap[categoryFilter];

      // V2 only has topics array
      const topicMatches =
        market.topics &&
        market.topics.some((topic) =>
          allowedCategories.some((cat) =>
            topic.toLowerCase().includes(cat.toLowerCase()),
          ),
        );

      if (!topicMatches) return false;
    }

    return true;
  });

  // Sort markets based on time filter
  const sortedMarkets = [...filteredMarkets].sort((a, b) => {
    if (timeFilter === "trending") {
      // Trending: Most volume first
      return (b.volume || 0) - (a.volume || 0);
    }
    if (timeFilter === "recent") {
      // Recientes: Most recently created first (V2 uses publishedAt)
      const aDate = a.publishedAt || a.createdAt || "";
      const bDate = b.publishedAt || b.createdAt || "";
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    }
    if (timeFilter === "closing-soon") {
      // Cierra Pronto: Soonest to expire first (only open markets)
      if (a.state !== "open" || b.state !== "open") return 0;
      const aExpires = a.expiresAt || a.expires_at || "";
      const bExpires = b.expiresAt || b.expires_at || "";
      if (!aExpires || !bExpires) return 0;
      return new Date(aExpires).getTime() - new Date(bExpires).getTime();
    }
    if (timeFilter === "closed") {
      // Cerrados: Most recently closed first
      const aExpires = a.expiresAt || a.expires_at || "";
      const bExpires = b.expiresAt || b.expires_at || "";
      return new Date(bExpires).getTime() - new Date(aExpires).getTime();
    }
    return 0;
  });

  const timeFilters: Array<{
    id: TimeFilter;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "recent", label: "Recientes", icon: Clock },
    { id: "closing-soon", label: "Cierra Pronto", icon: Calendar },
    { id: "closed", label: "Cerrados", icon: X },
    { id: "saved", label: "", icon: Bookmark }, // Icon only
  ];

  const categoryFilters: Array<{
    id: CategoryFilter;
    label: string;
  }> = [
    { id: "all", label: "Todos" },
    { id: "sports", label: "Deportes" },
    { id: "economy", label: "Economía" },
    { id: "politics", label: "Política" },
    { id: "crypto", label: "Crypto" },
    { id: "culture", label: "Cultura" },
    { id: "gaming", label: "Gaming" },
  ];

  return (
    <div className="space-y-4">
      {/* Filter Banner */}
      <div className="space-y-3 md:space-y-0">
        {/* Mobile: Two separate scrollable rows */}
        <div className="md:hidden space-y-3">
          {/* Time Filters Row - Mobile */}
          <div
            className="flex gap-2 overflow-x-auto scrollbar-hide px-1 py-1 -mx-1"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {timeFilters.map((filter) => {
              const Icon = filter.icon;
              const isActive = timeFilter === filter.id;
              return (
                <motion.button
                  key={filter.id}
                  onClick={() => {
                    haptics.selection();
                    setTimeFilter(filter.id);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-4 h-[36px] rounded-md border-2 transition-all duration-200 text-[14px] relative overflow-hidden flex-shrink-0",
                    isActive
                      ? "bg-electric-purple text-white border-electric-purple font-semibold"
                      : "bg-background border-border hover:border-electric-purple/50 text-foreground font-medium",
                  )}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTimeFilterMobile"
                      className="absolute inset-0 bg-electric-purple rounded-md -z-10"
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
                  )}
                  <Icon className="h-4 w-4 relative z-10" />
                  {filter.label && (
                    <span className="relative z-10">{filter.label}</span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Category Filters Row - Mobile */}
          <div
            className="flex gap-2 overflow-x-auto scrollbar-hide px-1 py-1 -mx-1"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {categoryFilters.map((filter) => {
              const isActive = categoryFilter === filter.id;
              return (
                <motion.button
                  key={filter.id}
                  onClick={() => {
                    haptics.selection();
                    setCategoryFilter(filter.id);
                  }}
                  className={cn(
                    "px-4 h-[36px] rounded-md transition-all duration-200 font-medium text-[14px] relative overflow-hidden flex-shrink-0",
                    isActive
                      ? "text-electric-purple bg-electric-purple/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeCategoryFilterMobile"
                      className="absolute inset-0 bg-electric-purple/5 rounded-md"
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
                  )}
                  <span className="relative z-10">{filter.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Desktop: Single row with wrapping */}
        <div className="hidden md:flex flex-wrap items-center gap-4 rounded-lg py-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Time Filters - Desktop */}
            {timeFilters.map((filter) => {
              const Icon = filter.icon;
              const isActive = timeFilter === filter.id;
              return (
                <motion.button
                  key={filter.id}
                  onClick={() => {
                    haptics.selection();
                    setTimeFilter(filter.id);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-4 h-[36px] rounded-md border-2 transition-all duration-200 text-[14px] relative overflow-hidden",
                    isActive
                      ? "bg-electric-purple text-white border-electric-purple font-semibold"
                      : "bg-background border-border hover:border-electric-purple/50 text-foreground font-medium",
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTimeFilter"
                      className="absolute inset-0 bg-electric-purple rounded-md -z-10"
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
                  )}
                  <Icon className="h-4 w-4 relative z-10" />
                  {filter.label && (
                    <span className="relative z-10">{filter.label}</span>
                  )}
                </motion.button>
              );
            })}

            {/* Divider */}
            <div className="h-8 w-px bg-border mx-2" />

            {/* Category Filters - Desktop */}
            {categoryFilters.map((filter) => {
              const isActive = categoryFilter === filter.id;
              return (
                <motion.button
                  key={filter.id}
                  onClick={() => {
                    haptics.selection();
                    setCategoryFilter(filter.id);
                  }}
                  className={cn(
                    "px-4 h-[36px] rounded-md transition-all duration-200 font-medium text-[14px] relative overflow-hidden",
                    isActive
                      ? "text-electric-purple bg-electric-purple/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeCategoryFilter"
                      className="absolute inset-0 bg-electric-purple/5 rounded-md"
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
                  )}
                  <span className="relative z-10">{filter.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Market Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${timeFilter}-${categoryFilter}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {isLoadingOpen || (timeFilter === "closed" && isLoadingClosed) ? (
            <div className="flex items-center justify-center py-12">
              <LogoSpinner size={32} />
            </div>
          ) : sortedMarkets.length > 0 ? (
            <TooltipProvider>
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  maxWidth: "100%",
                }}
              >
                {sortedMarkets.map((market, index) => (
                  <motion.div
                    key={`${market.id}-${market.slug || index}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.2,
                      delay: index * 0.05,
                      ease: "easeOut",
                    }}
                  >
                    <MarketCard market={market} />
                  </motion.div>
                ))}
              </div>
            </TooltipProvider>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No se encontraron mercados con estos filtros
              </p>
            </div>
          )}

          {/* Loading more indicator for closed markets */}
          {timeFilter === "closed" && isLoadingMore && (
            <div className="flex items-center justify-center py-8">
              <LogoSpinner size={32} />
            </div>
          )}

          {/* End of results message */}
          {timeFilter === "closed" &&
            hasLoadedClosed &&
            !hasMoreClosed &&
            sortedMarkets.length > 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">
                  Has llegado al final de los mercados cerrados
                </p>
              </div>
            )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
