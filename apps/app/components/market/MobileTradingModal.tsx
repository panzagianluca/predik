"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Info } from "lucide-react";
import { Market, Outcome } from "@/types/market";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@/components/animate-ui/components/radix/tabs";
import { logger } from "@/lib/logger";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/animate-ui/components/animate/tooltip";
import { cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";
import { translateOutcomeTitle } from "@/lib/translation/outcomeTranslations";
import {
  trackTradeCalculation,
  trackTradeInitiated,
  trackTradeCompleted,
  trackTradeFailed,
} from "@/lib/posthog";
import { useAccount, useWalletClient } from "wagmi";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

interface MobileTradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  market: Market;
  preselectedOutcomeId?: string;
  userAddress?: string;
  isConnected: boolean;
  onTradeComplete?: () => void;
}

interface TradeCalculation {
  shares: number;
  priceFrom: number;
  priceTo: number;
  avgPrice: number;
  fee: number;
  maxProfit: number;
  maxProfitPercent: number;
  priceImpact: number;
}

export function MobileTradingModal({
  isOpen,
  onClose,
  market,
  preselectedOutcomeId,
  userAddress,
  isConnected,
  onTradeComplete,
}: MobileTradingModalProps) {
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [selectedOutcome, setSelectedOutcome] = useState<Outcome | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [calculation, setCalculation] = useState<TradeCalculation | null>(null);
  const [balance, setBalance] = useState<any>(0);
  const [error, setError] = useState<string | null>(null);

  // Get wallet client and connector from wagmi (works for both MetaMask and embedded wallets)
  const { data: walletClient } = useWalletClient();
  const { connector } = useAccount();
  const { primaryWallet } = useDynamicContext();

  const quickAmounts = [1, 5, 25, 100];

  // Get provider - supports both external wallets (MetaMask) and embedded wallets (Dynamic)
  const getProvider = async () => {
    // For MetaMask or other browser extension wallets
    if (typeof window !== "undefined" && window.ethereum) {
      logger.log("🔌 Using window.ethereum provider (MetaMask/Browser wallet)");
      return window.ethereum;
    }

    // For embedded wallets and other connectors via wagmi
    // This uses wagmi's connector which properly wraps Dynamic's embedded wallets
    if (connector) {
      logger.log("🔌 Getting provider from wagmi connector:", {
        connectorName: connector.name,
        connectorType: connector.type,
      });

      try {
        const provider = await connector.getProvider();
        if (provider) {
          logger.log("✅ Got EIP-1193 provider from wagmi connector");
          return provider;
        }
      } catch (error) {
        logger.error("❌ Error getting provider from connector:", error);
      }
    }

    logger.warn("⚠️ No provider available - user not connected");
    return null;
  };

  // Set preselected outcome
  useEffect(() => {
    if (preselectedOutcomeId && isOpen) {
      const outcome = market.outcomes.find(
        (o) => String(o.id) === String(preselectedOutcomeId),
      );
      if (outcome) {
        setSelectedOutcome(outcome);
      }
    } else if (isOpen && !selectedOutcome) {
      setSelectedOutcome(market.outcomes[0] || null);
    }
  }, [preselectedOutcomeId, isOpen, market.outcomes]);

  // Load balance
  useEffect(() => {
    if (!isConnected || !userAddress || !isOpen || !market.token) {
      setBalance(0);
      return;
    }

    const checkAndLoad = async () => {
      const provider = await getProvider();
      if (!provider) {
        logger.warn("⚠️ No provider available for balance check");
        setBalance(0);
        return;
      }
      loadBalance();
    };

    checkAndLoad();
  }, [isConnected, userAddress, isOpen, market.token?.address]);

  // Calculate trade
  useEffect(() => {
    if (!amount || !selectedOutcome || parseFloat(amount) <= 0) {
      setCalculation(null);
      return;
    }
    calculateTrade();
  }, [amount, selectedOutcome, tradeType]);

  const loadBalance = async () => {
    try {
      const provider = (await getProvider()) as any;
      if (!provider) {
        logger.warn("⚠️ No provider available");
        setBalance(0);
        return;
      }

      // Check wallet network FIRST
      if (provider.request) {
        const chainId = String(
          await provider.request({
            method: "eth_chainId",
          }),
        );
        const expectedChainId = "0x38"; // BNB Chain = 56 = 0x38

        if (chainId !== expectedChainId) {
          logger.warn("⚠️ Wrong network for balance check:", chainId);
          setBalance(0);
          return;
        }
      }

      const polkamarketsjs = await import("polkamarkets-js");
      const web3Module = await import("web3");
      const Web3 = web3Module.default || web3Module;

      const polkamarkets = new polkamarketsjs.Application({
        web3Provider: provider,
      });

      const web3 = new Web3(provider as any);
      (window as any).web3 = web3;
      (polkamarkets as any).web3 = web3;

      if (provider.request) {
        await provider.request({ method: "eth_requestAccounts" });
      }

      if (!market.token) {
        setBalance(0);
        return;
      }

      const erc20 = polkamarkets.getERC20Contract({
        contractAddress: market.token.address,
      });

      try {
        const balanceWei = await erc20
          .getContract()
          .methods.balanceOf(userAddress)
          .call();
        const decimals = market.token.decimals || 18;
        const balanceFormatted = Number(balanceWei) / Math.pow(10, decimals);
        setBalance(balanceFormatted);
      } catch (directErr) {
        try {
          const tokenBalance = await erc20.getTokenAmount(userAddress!);
          if (
            tokenBalance !== null &&
            tokenBalance !== undefined &&
            !isNaN(Number(tokenBalance))
          ) {
            setBalance(tokenBalance);
          } else {
            setBalance(0);
          }
        } catch (sdkErr) {
          setBalance(0);
        }
      }
    } catch (err) {
      logger.error("❌ Error loading balance:", err);
      setBalance(0);
    }
  };

  const calculateTrade = async () => {
    if (!selectedOutcome || !amount || parseFloat(amount) <= 0) {
      setCalculation(null);
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      // Try to get provider, but allow calculations without it (for logged-out preview)
      const provider = (await getProvider()) as any;

      // If user is connected, validate network
      if (provider && provider.request && isConnected) {
        const chainId = String(
          await provider.request({
            method: "eth_chainId",
          }),
        );
        const expectedChainId = "0x38"; // BNB Chain = 56 = 0x38

        if (chainId !== expectedChainId) {
          setError(
            "Por favor conectá tu wallet a BNB Smart Chain (Chain ID 56)",
          );
          setCalculation(null);
          setIsCalculating(false);
          return;
        }
      }

      const polkamarketsjs = await import("polkamarkets-js");
      const web3Module = await import("web3");
      const Web3 = web3Module.default || web3Module;

      // Use provider if available, otherwise use public RPC for read-only calculations
      const web3Provider = provider || "https://bsc-dataseed.binance.org/";

      const polkamarkets = new polkamarketsjs.Application({
        web3Provider: web3Provider,
      });

      const web3 = new Web3(web3Provider as any);
      (window as any).web3 = web3;
      (polkamarkets as any).web3 = web3;

      const predictionMarket = polkamarkets.getPredictionMarketV3PlusContract({
        contractAddress:
          process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS || "",
        querierContractAddress:
          process.env.NEXT_PUBLIC_PREDICTION_MARKET_QUERIER || "",
      });

      const tradeAmount = parseFloat(amount);

      logger.log("🔢 Trade calculation:", {
        tradeType,
        marketId: market.id,
        outcomeId: selectedOutcome.id,
        amount: tradeAmount,
      });

      if (tradeType === "buy") {
        // Check balance but don't block calculation - just set warning
        if (isConnected && tradeAmount > Number(balance)) {
          setError(
            `Saldo insuficiente de ${
              market.token?.symbol || "USDT"
            }. Tienes ${Number(balance).toFixed(2)}, necesitas ${tradeAmount}`,
          );
        }

        // Use exact same API as desktop
        const calcResult = await predictionMarket.calcBuyAmount({
          marketId: market.id,
          outcomeId: selectedOutcome.id,
          value: tradeAmount,
        });

        const shares = Number(calcResult);
        const priceTo = tradeAmount / shares;
        const avgPrice = (selectedOutcome.price + priceTo) / 2;
        const fee = tradeAmount * (market.fees?.buy?.fee || 0);
        const maxProfit = shares - tradeAmount;
        const priceImpact =
          ((priceTo - selectedOutcome.price) / selectedOutcome.price) * 100;

        logger.log("📊 Buy calculation result:", {
          shares,
          priceTo,
          avgPrice,
          fee,
          maxProfit,
          priceImpact,
        });

        const calc: TradeCalculation = {
          shares,
          priceFrom: selectedOutcome.price,
          priceTo,
          avgPrice,
          fee,
          maxProfit,
          maxProfitPercent: (maxProfit / tradeAmount) * 100,
          priceImpact,
        };

        setCalculation(calc);

        // Track trade calculation
        trackTradeCalculation(
          market.id,
          market.slug,
          selectedOutcome.id,
          "buy",
          tradeAmount,
          shares,
          priceImpact,
        );
      } else {
        // Use exact same API as desktop
        const calcResult = await predictionMarket.calcSellAmount({
          marketId: market.id,
          outcomeId: selectedOutcome.id,
          value: tradeAmount,
        });

        const returnAmount = Number(calcResult);
        const priceTo = returnAmount / tradeAmount;
        const avgPrice = (selectedOutcome.price + priceTo) / 2;
        const fee = returnAmount * (market.fees?.sell?.fee || 0);
        const priceImpact =
          ((priceTo - selectedOutcome.price) / selectedOutcome.price) * 100;

        logger.log("📊 Sell calculation result:", {
          shares: tradeAmount,
          returnAmount,
          priceTo,
          avgPrice,
          fee,
          priceImpact,
        });

        const calc: TradeCalculation = {
          shares: tradeAmount,
          priceFrom: selectedOutcome.price,
          priceTo,
          avgPrice,
          fee,
          maxProfit: 0,
          maxProfitPercent: 0,
          priceImpact,
        };

        setCalculation(calc);

        // Track trade calculation
        trackTradeCalculation(
          market.id,
          market.slug,
          selectedOutcome.id,
          "sell",
          tradeAmount,
          tradeAmount,
          priceImpact,
        );
      }
    } catch (err) {
      logger.error("Error calculating trade:", err);
      setError(
        "No se puede calcular la operación. El mercado puede estar cerrado o tener liquidez insuficiente.",
      );
      setCalculation(null);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleExecuteTrade = async () => {
    if (
      !isConnected ||
      !userAddress ||
      !selectedOutcome ||
      !amount ||
      !market.token
    ) {
      setError("Please connect your wallet and enter an amount");
      return;
    }

    const provider = (await getProvider()) as any;
    if (!provider) {
      setError("No wallet provider available. Please connect your wallet.");
      setIsExecuting(false);
      return;
    }

    const tradeAmount = parseFloat(amount);

    if (tradeAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (tradeType === "buy" && tradeAmount > Number(balance)) {
      setError(
        `Saldo insuficiente de ${market.token.symbol}. Tienes ${Number(
          balance,
        ).toFixed(2)}, necesitas ${tradeAmount}`,
      );
      return;
    }

    setIsExecuting(true);
    setError(null);
    haptics.medium();

    try {
      const polkamarketsjs = await import("polkamarkets-js");
      const web3Module = await import("web3");
      const Web3 = web3Module.default || web3Module;

      const polkamarkets = new polkamarketsjs.Application({
        web3Provider: provider,
      });

      const web3 = new Web3(provider as any);
      (window as any).web3 = web3;
      (polkamarkets as any).web3 = web3;

      if (provider.request) {
        await provider.request({ method: "eth_requestAccounts" });
      }

      const predictionMarket = polkamarkets.getPredictionMarketV3PlusContract({
        contractAddress:
          process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS || "",
        querierContractAddress:
          process.env.NEXT_PUBLIC_PREDICTION_MARKET_QUERIER || "",
      });

      const erc20 = polkamarkets.getERC20Contract({
        contractAddress: market.token.address,
      });

      const tradeAmount = parseFloat(amount);

      logger.log("💰 Executing trade:", {
        tradeType,
        marketId: market.id,
        outcomeId: selectedOutcome.id,
        amount: tradeAmount,
      });

      // Track trade initiated
      trackTradeInitiated(
        market.id,
        market.slug,
        selectedOutcome.id,
        tradeType,
        tradeAmount,
      );

      if (tradeType === "buy") {
        // Check and approve if needed (same as desktop)
        const spenderAddress =
          process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS || "";
        const isApproved = await erc20.isApproved({
          address: userAddress,
          amount: tradeAmount,
          spenderAddress,
        });

        logger.log("💰 Token approval status:", {
          isApproved,
          spenderAddress,
          amount: tradeAmount,
        });

        if (!isApproved) {
          logger.log("⏳ Approving token spend...");
          await erc20.approve({
            address: spenderAddress,
            amount: tradeAmount * 10,
          });
          logger.log("✅ Approval complete");
        }

        // Calculate shares with slippage (same as desktop)
        const minShares = await predictionMarket.calcBuyAmount({
          marketId: market.id,
          outcomeId: selectedOutcome.id,
          value: tradeAmount,
        });
        const minSharesWithSlippage = Number(minShares) * 0.98;

        logger.log("📊 Buy calculation:", {
          minShares: Number(minShares),
          minSharesWithSlippage,
          slippage: "2%",
        });

        // Execute buy with referral code (same as desktop)
        logger.log("🔄 Executing buy transaction with referral code...");
        const buyTx = await predictionMarket.referralBuy({
          marketId: market.id,
          outcomeId: selectedOutcome.id,
          value: tradeAmount,
          minOutcomeSharesToBuy: minSharesWithSlippage,
          code: "predik", // Referral code for revenue share
        });

        logger.log("✅ Buy successful:", buyTx);
        haptics.success();

        // Track successful trade
        trackTradeCompleted(
          market.id,
          market.slug,
          selectedOutcome.id,
          selectedOutcome.title,
          "buy",
          tradeAmount,
          Number(minShares),
          buyTx?.transactionHash,
        );
      } else {
        // Execute sell (same as desktop)
        const maxShares = await predictionMarket.calcSellAmount({
          marketId: market.id,
          outcomeId: selectedOutcome.id,
          value: tradeAmount,
        });

        logger.log("📊 Sell calculation:", {
          maxShares: Number(maxShares),
        });

        logger.log("🔄 Executing sell transaction with referral code...");
        const sellTx = await predictionMarket.referralSell({
          marketId: market.id,
          outcomeId: selectedOutcome.id,
          value: tradeAmount,
          maxOutcomeSharesToSell: Number(maxShares),
          code: "predik", // Referral code for revenue share
        });

        logger.log("✅ Sell successful:", sellTx);
        haptics.success();

        // Track successful trade
        trackTradeCompleted(
          market.id,
          market.slug,
          selectedOutcome.id,
          selectedOutcome.title,
          "sell",
          tradeAmount,
          Number(maxShares),
          sellTx?.transactionHash,
        );
      }

      setAmount("");
      setCalculation(null);
      onTradeComplete?.();
      onClose();
    } catch (err: any) {
      logger.error("Trade execution error:", err);
      haptics.error();
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(`Operación fallida: ${message}`);

      // Track failed trade
      trackTradeFailed(
        market.id,
        market.slug,
        selectedOutcome.id,
        tradeType,
        parseFloat(amount),
        err.message || "Error desconocido",
        err.name || "Unknown",
      );
    } finally {
      setIsExecuting(false);
    }
  };

  const handleQuickAmount = (value: number | "max") => {
    if (value === "max") {
      setAmount(Number(balance).toFixed(2));
    } else {
      setAmount(value.toString());
    }
  };

  const handleClose = () => {
    setAmount("");
    setCalculation(null);
    setError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60] lg:hidden"
            onClick={handleClose}
          />

          {/* Modal - Slides from bottom, ALIGNED TO TOP for keyboard */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="fixed bottom-0 left-0 right-0 bg-background border-t border-border rounded-t-3xl z-[60] lg:hidden h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0 gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <img
                  src={market.imageUrl}
                  alt={market.titleEs || market.title}
                  className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                />
                <h3 className="font-semibold text-[16px] leading-tight truncate">
                  {market.titleEs || market.title}
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="h-10 w-10 rounded-lg flex items-center justify-center transition-colors hover:bg-electric-purple/10 active:bg-electric-purple/20 flex-shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content - Scrollable, starts at TOP */}
            <div className="overflow-y-auto flex-1 p-4 pb-24 space-y-4">
              {/* Buy/Sell Tabs */}
              <Tabs
                value={tradeType}
                onValueChange={(value) => setTradeType(value as "buy" | "sell")}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="buy"
                    onClick={() => haptics.selection()}
                    className="data-[state=active]:text-green-600"
                  >
                    Comprar
                  </TabsTrigger>
                  <TabsTrigger
                    value="sell"
                    onClick={() => haptics.selection()}
                    className="data-[state=active]:text-red-600"
                  >
                    Vender
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Balance Display */}
              {isConnected && (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Balance</span>
                  <span className="font-semibold">
                    {Number(balance).toFixed(2)}{" "}
                    {market.token?.symbol || "USDT"}
                  </span>
                </div>
              )}

              {/* Outcome Selection */}
              <div className="space-y-2">
                <Label>Seleccionar Resultado</Label>
                <div className="grid grid-cols-2 gap-2">
                  {market.outcomes.map((outcome) => (
                    <Button
                      key={outcome.id}
                      variant={
                        selectedOutcome?.id === outcome.id
                          ? "default"
                          : "outline"
                      }
                      onClick={() => setSelectedOutcome(outcome)}
                      className={cn(
                        "h-auto py-3 transition-all duration-300 ease-in-out relative overflow-hidden",
                        selectedOutcome?.id === outcome.id &&
                          "bg-electric-purple hover:bg-electric-purple/90 border-electric-purple shadow-lg shadow-electric-purple/20",
                      )}
                    >
                      {selectedOutcome?.id === outcome.id && (
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                      )}
                      <div className="flex items-center justify-between w-full gap-2 relative z-10">
                        <span className="font-semibold text-sm">
                          {translateOutcomeTitle(outcome.title)}
                        </span>
                        <span className="text-xs opacity-80">
                          {(outcome.price * 100).toFixed(2)}%
                        </span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="amount">Monto</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleExecuteTrade();
                    }
                  }}
                  min="0"
                  step="0.01"
                  disabled={isExecuting}
                />

                {/* Quick Amount Buttons */}
                <div className="flex gap-2">
                  {quickAmounts.map((qa) => (
                    <Button
                      key={qa}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAmount(qa)}
                      disabled={isExecuting}
                      className="flex-1"
                    >
                      {qa}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAmount("max")}
                    disabled={
                      isExecuting || !isConnected || Number(balance) === 0
                    }
                    className="flex-1"
                  >
                    MÁX
                  </Button>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}

              {/* Loading State */}
              {isCalculating && amount && parseFloat(amount) > 0 && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-electric-purple" />
                </div>
              )}

              {/* Trade Summary - Show even with errors like desktop */}
              {!isCalculating && calculation && (
                <div className="border border-border rounded-lg p-4 space-y-3 bg-muted/30">
                  <h4 className="font-semibold text-sm">
                    Resumen de Operación
                  </h4>

                  <div className="space-y-2">
                    {/* Price Range */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Precio</span>
                      <span className="font-medium">
                        {(calculation.priceFrom * 100).toFixed(2)}% →{" "}
                        {(calculation.priceTo * 100).toFixed(2)}%
                      </span>
                    </div>

                    {/* Shares */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Acciones{" "}
                        {tradeType === "buy" ? "Recibidas" : "Vendidas"}
                      </span>
                      <span className="font-medium">
                        {calculation.shares.toFixed(2)}
                      </span>
                    </div>

                    {/* Fee */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tarifa</span>
                      <span>
                        {calculation.fee.toFixed(2)}{" "}
                        {market.token?.symbol || "USDT"}
                      </span>
                    </div>

                    {/* Max Profit (Buy only) */}
                    {tradeType === "buy" && (
                      <div className="flex items-center justify-between text-sm border-t pt-2">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">
                            Ganancia Máxima
                          </span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  className="inline-flex cursor-help"
                                  type="button"
                                >
                                  <Info className="h-3 w-3 text-muted-foreground" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">
                                  Si este resultado gana (llega al 100%)
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-green-600">
                            +{calculation.maxProfit.toFixed(2)}{" "}
                            {market.token?.symbol || "USDT"}
                          </span>
                          <span className="text-xs text-green-600">
                            ({calculation.maxProfitPercent.toFixed(2)}%)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer - Execute Button */}
            <div className="p-4 border-t border-border flex-shrink-0">
              <Button
                onClick={handleExecuteTrade}
                disabled={
                  !isConnected ||
                  isExecuting ||
                  isCalculating ||
                  !amount ||
                  parseFloat(amount) <= 0 ||
                  !!error
                }
                className={cn(
                  "w-full transition-all duration-300 h-12",
                  tradeType === "buy"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700",
                )}
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Procesando...
                  </>
                ) : (
                  <>
                    {tradeType === "buy"
                      ? "Comprar Acciones"
                      : "Vender Acciones"}
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
