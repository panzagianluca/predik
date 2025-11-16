"use client";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { config } from "@/lib/wagmi";
import { ReactNode, useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { trackWalletConnected, trackWalletDisconnected } from "@/lib/posthog";
import { toast } from "sonner";

// Inner component to track wallet connections
function WalletTracker() {
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (isConnected && address) {
      // Track wallet connection
      trackWalletConnected(address);
    }
  }, [isConnected, address]);

  useEffect(() => {
    // Track disconnection when component unmounts or wallet disconnects
    return () => {
      if (!isConnected) {
        trackWalletDisconnected();
      }
    };
  }, [isConnected]);

  return null;
}

export function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <DynamicContextProvider
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID!,
        walletConnectors: [EthereumWalletConnectors],
        // Multi-wallet configuration
        // Allows users to connect with any wallet (Google, MetaMask, X, etc.) from any device
        // and link multiple wallets to one account
        // Note: Social logins (Google, Twitter, etc.) are configured in the Dynamic Dashboard
        // at https://app.dynamic.xyz/dashboard/configurations
        events: {
          // Handle authentication cancellation
          onAuthFlowCancel: () => {
            toast.error("Autenticación cancelada", {
              description:
                "Podés intentar conectarte nuevamente cuando quieras",
              duration: 4000,
            });
          },
          // Handle successful authentication
          onAuthSuccess: (args) => {
            toast.success("¡Conectado con éxito!", {
              description: "Tu wallet está lista para operar",
              duration: 3000,
            });
          },
        },
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>
            <WalletTracker />
            {children}
          </DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
}
