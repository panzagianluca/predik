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
        // Multi-wallet is enabled via Dynamic Dashboard:
        // https://app.dynamic.xyz/dashboard/log-in-user-profile
        // Toggle "Multi-Wallet" in the "Branded Wallets" section
        // This allows users to link multiple wallets (MetaMask, Google, X, etc.) to one account
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
