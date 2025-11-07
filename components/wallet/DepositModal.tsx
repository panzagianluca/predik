"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/animate-ui/components/radix/tabs";
import { Button } from "@/components/ui/button";
import {
  Check,
  Copy,
  ExternalLink,
  ChevronDown,
  HelpCircle,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { LiFiWidget } from "@lifi/widget";
import {
  trackDepositModalOpened,
  trackDepositTabSelected,
  trackAddressCopied,
  trackBridgeUsed,
} from "@/lib/posthog";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
}

export function DepositModal({
  isOpen,
  onClose,
  walletAddress,
}: DepositModalProps) {
  const [copied, setCopied] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showBridgeTooltip, setShowBridgeTooltip] = useState(false);
  const [activeTab, setActiveTab] = useState<"address" | "buy" | "bridge">(
    "address",
  );
  const { resolvedTheme, setTheme } = useTheme();
  const { setShowDynamicUserProfile } = useDynamicContext();

  // Track modal open
  useEffect(() => {
    if (isOpen) {
      trackDepositModalOpened();
    }
  }, [isOpen]);

  // Handle Buy tab - Open Dynamic on-ramp
  const handleBuyClick = () => {
    // Close the deposit modal
    onClose();
    // Open Dynamic's user profile with on-ramp view
    setShowDynamicUserProfile(true);
  };

  // Prevent LiFi Widget from changing global theme
  useEffect(() => {
    if (!isOpen) return;

    const currentTheme = resolvedTheme;

    // Monitor for theme changes and restore
    const observer = new MutationObserver(() => {
      const htmlElement = document.documentElement;
      const currentClass = htmlElement.className;

      // If the widget changed the theme, restore it
      if (currentTheme === "dark" && !currentClass.includes("dark")) {
        htmlElement.classList.add("dark");
      } else if (currentTheme === "light" && currentClass.includes("dark")) {
        htmlElement.classList.remove("dark");
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    return () => observer.disconnect();
  }, [isOpen, resolvedTheme]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    // Track address copy
    trackAddressCopied("deposit");
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Li.Fi Widget Configuration
  const lifiConfig = {
    integrator: "Predik",
    theme: {
      palette: {
        primary: { main: "#8B5CF6" },
      },
      container: {
        boxShadow: "none",
        borderRadius: "8px",
      },
    },
    appearance: (resolvedTheme === "dark" ? "dark" : "light") as
      | "dark"
      | "light",
  };

  // Listen for Li.Fi widget postMessage events to detect completed bridge transfers.
  // Li.Fi emits messages to the parent window; the payload shape can vary between versions.
  // We use a best-effort heuristic to detect completed transfers and forward a concise event to PostHog.
  useEffect(() => {
    if (!isOpen) return;

    const handleLiFiMessage = (e: MessageEvent) => {
      try {
        const data = e.data;
        if (!data || typeof data !== "object") return;

        // Common places LiFi may include useful info
        const status =
          data.status || data.execution?.status || data.transfer?.status;
        const amountRaw =
          data.amount ||
          data.execution?.amount ||
          data.transfer?.amount ||
          data.details?.amount;
        const token =
          data.token ||
          data.execution?.token ||
          data.transfer?.token ||
          data.details?.token;
        const fromChain =
          data.fromChain ||
          data.execution?.fromChain ||
          data.transfer?.fromChain ||
          data.details?.from_chain;
        const toChain =
          data.toChain ||
          data.execution?.toChain ||
          data.transfer?.toChain ||
          data.details?.to_chain;

        // Heuristic: treat these statuses as completed
        const completedStatuses = new Set([
          "DONE",
          "COMPLETED",
          "SUCCESS",
          "EXECUTED",
        ]);

        const isCompleted =
          typeof status === "string" &&
          completedStatuses.has(status.toUpperCase());

        // Some LiFi messages don't use the status field — inspect event name variants
        const eventName = (data.event || data.name || "")
          .toString()
          .toLowerCase();
        const eventIndicatesComplete =
          eventName.includes("transfer") &&
          (eventName.includes("complete") ||
            eventName.includes("done") ||
            eventName.includes("success"));

        if (isCompleted || eventIndicatesComplete) {
          // Normalize amount to number when possible
          let amount: number | undefined = undefined;
          if (typeof amountRaw === "string") {
            const parsed = parseFloat(amountRaw.replace(/[^0-9.-]+/g, ""));
            if (!Number.isNaN(parsed)) amount = parsed;
          } else if (typeof amountRaw === "number") {
            amount = amountRaw;
          }

          // Send event to PostHog with best-effort properties
          try {
            // trackBridgeUsed is imported above
            trackBridgeUsed(fromChain, toChain, amount, token);
          } catch (err) {
            // Swallow errors from tracking to avoid breaking the widget
            // eslint-disable-next-line no-console
            console.warn("PostHog bridge tracking failed:", err);
          }
        }
      } catch (err) {
        // Ignore malformed messages from other origins
      }
    };

    window.addEventListener("message", handleLiFiMessage);

    return () => window.removeEventListener("message", handleLiFiMessage);
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[500px] w-full p-0 gap-0 max-h-[90vh] flex flex-col overflow-hidden"
        from="top"
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
      >
        <DialogTitle className="sr-only">Depositar USDT</DialogTitle>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b">
          <h2 className="text-xl font-semibold">Depositar USDT</h2>
        </div>

        {/* Tabs Section - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <Tabs
            defaultValue="address"
            className="w-full mt-4"
            value={activeTab}
            onValueChange={(value) => {
              const tabValue = value as "address" | "buy" | "bridge";
              setActiveTab(tabValue);
              trackDepositTabSelected(tabValue);
            }}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="address">Depositar</TabsTrigger>
              <TabsTrigger value="buy">Comprar</TabsTrigger>
              <TabsTrigger value="bridge">Bridge</TabsTrigger>
            </TabsList>

            {/* Tab 1: CEX */}
            <TabsContent value="address" className="space-y-4 mt-4">
              <div className="rounded-lg border bg-card p-4">
                {/* QR Code */}
                <div className="flex flex-col items-center gap-3 py-4 bg-white dark:bg-muted rounded-lg mb-4">
                  <QRCodeSVG
                    value={walletAddress}
                    size={160}
                    level="M"
                    includeMargin={true}
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                  <p className="text-xs text-center text-muted-foreground px-4">
                    Escaneá para enviar USDT a BNB Smart Chain
                  </p>
                </div>

                {/* Full Wallet Address */}
                <div className="mb-4">
                  <div className="flex gap-2">
                    <div className="flex-1 px-3 py-2 bg-muted border rounded-md text-xs font-mono break-all">
                      {walletAddress}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-auto shrink-0"
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-4 mb-4">
                  <p className="text-sm font-medium mb-3">
                    Retirá USDT vía BNB Smart Chain desde:
                  </p>
                  <ul className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-electric-purple" />
                      <span>Lemon Cash</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-electric-purple" />
                      <span>Bitget</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-electric-purple" />
                      <span>Binance</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-electric-purple" />
                      <span>Bybit</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-electric-purple" />
                      <span>OKX</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-electric-purple" />
                      <span>Cualquier otro exchange</span>
                    </li>
                  </ul>
                </div>

                {/* Instructions Accordion */}
                <div className="border-t pt-4">
                  <button
                    onClick={() => setShowInstructions(!showInstructions)}
                    className="w-full flex items-center justify-between text-sm font-medium py-2 hover:text-electric-purple transition-colors"
                  >
                    <span>¿Cómo retirar?</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        showInstructions ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showInstructions && (
                    <ol className="text-sm text-muted-foreground space-y-1.5 ml-4 mt-2">
                      <li className="flex gap-2">
                        <span className="font-semibold text-foreground">
                          1.
                        </span>
                        <span>Abrí tu exchange</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold text-foreground">
                          2.
                        </span>
                        <span>Buscá USDT y tocá &quot;Retirar&quot;</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold text-foreground">
                          3.
                        </span>
                        <span>
                          Seleccioná red <strong>BNB Smart Chain</strong> (o{" "}
                          <strong>BSC</strong>)
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold text-foreground">
                          4.
                        </span>
                        <span>Pegá la dirección de arriba</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold text-foreground">
                          5.
                        </span>
                        <span>Confirmá el retiro</span>
                      </li>
                    </ol>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Buy (On-Ramp) */}
            <TabsContent value="buy" className="space-y-4 mt-4">
              <div className="rounded-lg border bg-card p-6">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-electric-purple/10 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-electric-purple"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Comprá USDT con tarjeta
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Comprá USDT directamente con tarjeta de débito o crédito y
                      recibilo en tu wallet
                    </p>
                  </div>
                  <Button
                    onClick={handleBuyClick}
                    className="w-full bg-electric-purple hover:bg-electric-purple/90"
                  >
                    Abrir Compra
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Powered by Dynamic
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Tab 3: Bridge (Li.Fi Widget) */}
            <TabsContent value="bridge" className="space-y-4 mt-4">
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="font-semibold">Transferir desde otra red</h3>
                  <div className="relative">
                    <button
                      onMouseEnter={() => setShowBridgeTooltip(true)}
                      onMouseLeave={() => setShowBridgeTooltip(false)}
                      onClick={() => setShowBridgeTooltip(!showBridgeTooltip)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <HelpCircle className="h-4 w-4" />
                    </button>
                    {showBridgeTooltip && (
                      <div className="absolute left-0 top-6 z-50 w-64 p-3 bg-popover border rounded-md shadow-lg text-xs text-popover-foreground">
                        Si ya tenés USDT en otra blockchain (Ethereum, Polygon,
                        etc.), podés hacer bridge a BNB Smart Chain
                      </div>
                    )}
                  </div>
                </div>

                {/* Li.Fi Widget */}
                <div className="rounded-lg overflow-hidden [&_*]:!text-inherit">
                  <LiFiWidget integrator="Predik" config={lifiConfig} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
