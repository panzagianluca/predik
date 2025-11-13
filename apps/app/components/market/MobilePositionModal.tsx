"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, TrendingUp, Share2, Sparkles } from "lucide-react";
import { Market } from "@/types/market";
import { haptics } from "@/lib/haptics";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { trackWinningsClaimed } from "@/lib/posthog";
import { Button } from "@/components/ui/button";

interface MobilePositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  market: Market;
  userAddress: string;
  onClaimSuccess?: () => void;
}

interface UserPosition {
  outcomeId: number;
  outcomeName: string;
  shares: bigint;
  sharesFormatted: number;
  avgPrice: number;
  currentValue: number;
  invested: number;
  pnl: number;
  pnlPercent: number;
  isWinner: boolean;
  hasShares: boolean;
}

export function MobilePositionModal({
  isOpen,
  onClose,
  market,
  userAddress,
  onClaimSuccess,
}: MobilePositionModalProps) {
  const [position, setPosition] = useState<UserPosition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadUserPosition();
    }
  }, [isOpen, market.id, userAddress]);

  const loadUserPosition = async () => {
    try {
      setIsLoading(true);

      if (!market.token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `/api/user-position/${market.id}/${userAddress}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user position");
      }

      const data = await response.json();
      const outcomeShares = data.outcomeShares;

      let userOutcome: UserPosition | null = null;

      for (let i = 0; i < market.outcomes.length; i++) {
        const outcome = market.outcomes[i];
        const sharesRaw = outcomeShares[i];

        if (!sharesRaw || sharesRaw === "0" || Number(sharesRaw) === 0) {
          continue;
        }

        const decimals = market.token.decimals || 18;
        const shares = BigInt(sharesRaw);
        const sharesFormatted = Number(sharesRaw) / Math.pow(10, decimals);
        const currentValue = sharesFormatted * outcome.price;

        const avgPrice = outcome.price;
        const invested = sharesFormatted * avgPrice;
        const pnl = currentValue - invested;
        const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;

        const isWinner =
          market.state === "resolved" &&
          (market.resolvedOutcomeId === outcome.id ||
            (market.resolvedOutcomeId === null && outcome.price === 1));

        userOutcome = {
          outcomeId: outcome.id,
          outcomeName: outcome.title,
          shares,
          sharesFormatted,
          avgPrice,
          currentValue,
          invested,
          pnl,
          pnlPercent,
          isWinner,
          hasShares: true,
        };

        break;
      }

      setPosition(userOutcome);

      if (userOutcome && userOutcome.isWinner && market.state === "resolved") {
        setHasClaimed(false);
      }
    } catch (error) {
      console.error("Error loading user position:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!position || !position.isWinner || hasClaimed) return;

    try {
      setIsClaiming(true);
      haptics.medium();

      if (window.ethereum) {
        const chainId = String(
          await window.ethereum.request({
            method: "eth_chainId",
          }),
        );
        const expectedChainId = "0x38";

        if (chainId !== expectedChainId) {
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: expectedChainId }],
            });
          } catch (switchError: any) {
            if (switchError.code === 4902) {
              toast.error("Por favor agregá BNB Chain a tu wallet");
            } else {
              toast.error("Por favor cambiá a BNB Chain para reclamar");
            }
            setIsClaiming(false);
            return;
          }
        }
      }

      const polkamarketsjs = await import("polkamarkets-js");
      const web3Module = await import("web3");
      const Web3 = web3Module.default || web3Module;

      const polkamarkets = new polkamarketsjs.Application({
        web3Provider: window.ethereum,
      });

      const web3 = new Web3(window.ethereum as any);
      (window as any).web3 = web3;
      (polkamarkets as any).web3 = web3;

      const pm = polkamarkets.getPredictionMarketV3PlusContract({
        contractAddress: process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS!,
      });

      await pm.claimWinnings({
        marketId: market.id,
      });

      trackWinningsClaimed(market.id, market.slug, position.currentValue);

      toast.success("¡Ganancias reclamadas exitosamente!");
      haptics.success();

      setHasClaimed(true);
      onClaimSuccess?.();
    } catch (error: any) {
      console.error("Claim failed:", error);
      toast.error(error?.message || "Error al reclamar. Intentá de nuevo.");
      haptics.error();
    } finally {
      setIsClaiming(false);
    }
  };

  const handleShare = () => {
    haptics.light();
    const text = `¡Gané ${position?.pnl.toFixed(
      2,
    )} USDT (${position?.pnlPercent.toFixed(0)}%) en ${
      market.titleEs || market.title
    }! 🎯`;
    const url = `${window.location.origin}/markets/${market.slug}`;

    if (navigator.share) {
      navigator.share({ text, url });
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`);
      toast.success("¡Copiado al portapapeles!");
    }
  };

  const handleClose = () => {
    haptics.light();
    onClose();
  };

  const isResolved = market.state === "resolved";
  const canClaim = position && isResolved && position.isWinner && !hasClaimed;
  const showFlexButton = position && position.isWinner;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
            }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <h2 className="text-lg font-semibold">Mi Predicción</h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : !position || !position.hasShares ? (
                <div className="text-center py-12 text-muted-foreground">
                  No tenés posición en este mercado
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Resultado */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Resultado
                    </span>
                    <div
                      className={cn(
                        "px-3 py-1.5 rounded-lg font-semibold text-sm flex items-center gap-2",
                        position.isWinner &&
                          "bg-purple-500/10 text-purple-600 dark:text-purple-400",
                        !position.isWinner && "bg-muted text-muted-foreground",
                      )}
                    >
                      {position.isWinner && <Sparkles className="h-4 w-4" />}
                      {position.outcomeName}
                    </div>
                  </div>

                  {/* Posición */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Posición
                    </span>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${position.currentValue.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {position.sharesFormatted.toFixed(2)} acciones @ $
                        {position.avgPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Ganancia/Pérdida */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Ganancia/Pérdida
                    </span>
                    <div className="text-right">
                      <p
                        className={cn(
                          "font-semibold flex items-center justify-end gap-1",
                          position.pnl >= 0 ? "text-green-500" : "text-red-500",
                        )}
                      >
                        {position.pnl >= 0 && (
                          <TrendingUp className="h-4 w-4" />
                        )}
                        {position.pnl >= 0 ? "+" : ""}${position.pnl.toFixed(2)}
                      </p>
                      <p
                        className={cn(
                          "text-xs",
                          position.pnl >= 0 ? "text-green-500" : "text-red-500",
                        )}
                      >
                        {position.pnlPercent >= 0 ? "+" : ""}
                        {position.pnlPercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  {/* Estado */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Estado
                    </span>
                    <span
                      className={cn(
                        "font-semibold text-sm",
                        position.isWinner && !hasClaimed && "text-green-500",
                        position.isWinner && hasClaimed && "text-blue-500",
                        !position.isWinner && "text-muted-foreground",
                        !isResolved && "text-orange-500",
                      )}
                    >
                      {!isResolved && "Pendiente"}
                      {isResolved &&
                        position.isWinner &&
                        !hasClaimed &&
                        "Ganaste"}
                      {isResolved &&
                        position.isWinner &&
                        hasClaimed &&
                        "Reclamado"}
                      {isResolved && !position.isWinner && "Perdiste"}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    {showFlexButton && (
                      <Button
                        variant="outline"
                        onClick={handleShare}
                        className="flex-1 border-purple-500/50 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Compartir
                      </Button>
                    )}

                    {canClaim && (
                      <Button
                        onClick={handleClaim}
                        disabled={isClaiming}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        {isClaiming ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Reclamando...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Reclamar
                          </>
                        )}
                      </Button>
                    )}

                    {hasClaimed && (
                      <Button
                        disabled
                        className="flex-1 bg-blue-600/50 text-white cursor-not-allowed"
                      >
                        ✓ Reclamado
                      </Button>
                    )}

                    {!isResolved && (
                      <div className="flex-1 text-center text-sm text-muted-foreground py-2">
                        Esperando resolución...
                      </div>
                    )}
                  </div>

                  {/* Message for losers */}
                  {isResolved && !position.isWinner && (
                    <div className="text-center text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                      Tus acciones no ganaron esta vez
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
