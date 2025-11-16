"use client";

import { useReadContract, useAccount } from "wagmi";
import { formatUnits } from "viem";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

// TODO: Update this address when migrating to CELO Mainnet
// Current: Celo Sepolia Testnet USDT
const USDT_TOKEN_ADDRESS =
  (process.env.NEXT_PUBLIC_USDT_TOKEN_ADDRESS as `0x${string}`) ||
  ("0x" as `0x${string}`);

const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
] as const;

/**
 * Hook to get USDT token balance for the connected wallet
 *
 * When user has multiple linked wallets (e.g., MetaMask + Google embedded wallet),
 * this will check the balance of whichever wallet is currently active.
 *
 * Priority:
 * 1. External wallet (MetaMask, etc.) if connected via wagmi
 * 2. Primary wallet from Dynamic (embedded or linked wallet)
 *
 * @returns {Object} balance information
 * @returns {string} formatted - Formatted balance as string (e.g., "100.50")
 * @returns {bigint | undefined} raw - Raw balance in smallest unit
 * @returns {boolean} isLoading - Loading state
 * @returns {Error | null} error - Error if any
 *
 * @example
 * const { formatted, isLoading } = useUSDTBalance()
 * return <div>Balance: {formatted} USDT</div>
 */
export function useUSDTBalance() {
  const { address } = useAccount();
  const { primaryWallet } = useDynamicContext();

  // Use external wallet if connected, otherwise use primary wallet from Dynamic
  const walletAddress = address || primaryWallet?.address;

  const {
    data: balance,
    isLoading,
    error,
  } = useReadContract({
    address: USDT_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: walletAddress ? [walletAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!walletAddress, // Only fetch when address is available
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  const { data: decimals } = useReadContract({
    address: USDT_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "decimals",
    query: {
      enabled: !!USDT_TOKEN_ADDRESS,
    },
  });

  const formatted =
    balance !== undefined && decimals !== undefined
      ? formatUnits(balance as bigint, decimals as number)
      : "0.00";

  return {
    formatted,
    raw: balance,
    isLoading,
    error: error as Error | null,
  };
}
