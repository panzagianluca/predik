"use client";

import { useEffect, useState } from "react";
import { Address } from "viem";
import { MarketAction } from "@/lib/abis/PredictionMarketV3_4";
import { logger } from "@/lib/logger";

// Re-export for convenience
export { MarketAction } from "@/lib/abis/PredictionMarketV3_4";

export interface UserTransaction {
  hash: string;
  marketId: bigint;
  action: MarketAction;
  actionLabel: string;
  outcomeId: bigint;
  shares: bigint;
  value: bigint;
  timestamp: number;
  blockNumber: bigint;
}

export interface TransactionStats {
  totalInvested: bigint;
  totalWithdrawn: bigint;
  netPosition: bigint;
  transactionCount: number;
  marketsTraded: Set<string>;
}

export interface OpenPosition {
  marketId: string;
  outcomeId: string;
  shares: bigint;
  totalBought: bigint;
  totalSold: bigint;
  invested: bigint;
  receivedFromSells: bigint;
  avgEntryPrice: number;
}

interface UseUserTransactionsResult {
  transactions: UserTransaction[];
  stats: TransactionStats;
  positions: OpenPosition[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// GraphQL query for user data
const USER_DATA_QUERY = `
  query GetUserData($userAddress: String!) {
    user(id: $userAddress) {
      address
      totalInvested
      totalWithdrawn
      netPosition
      transactionCount
      marketsTraded
      transactions(orderBy: timestamp, orderDirection: desc, first: 1000) {
        id
        transactionHash
        marketId
        action
        actionLabel
        outcomeId
        shares
        value
        timestamp
        blockNumber
      }
      positions(where: { isOpen: true }) {
        marketId
        outcomeId
        shares
        totalBought
        totalSold
        invested
        receivedFromSells
        avgEntryPrice
      }
    }
  }
`;

const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL || "";

export function useUserTransactions(
  userAddress?: Address,
): UseUserTransactionsResult {
  const [transactions, setTransactions] = useState<UserTransaction[]>([]);
  const [positions, setPositions] = useState<OpenPosition[]>([]);
  const [stats, setStats] = useState<TransactionStats>({
    totalInvested: BigInt(0),
    totalWithdrawn: BigInt(0),
    netPosition: BigInt(0),
    transactionCount: 0,
    marketsTraded: new Set(),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const refetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    if (!userAddress || !SUBGRAPH_URL) {
      setTransactions([]);
      setPositions([]);
      setStats({
        totalInvested: BigInt(0),
        totalWithdrawn: BigInt(0),
        netPosition: BigInt(0),
        transactionCount: 0,
        marketsTraded: new Set(),
      });
      return;
    }

    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        logger.log("🔍 Fetching user data from subgraph...", {
          userAddress,
          subgraphUrl: SUBGRAPH_URL,
        });

        const response = await fetch(SUBGRAPH_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: USER_DATA_QUERY,
            variables: {
              userAddress: userAddress.toLowerCase(),
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`Subgraph request failed: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.errors) {
          throw new Error(
            `GraphQL errors: ${result.errors
              .map((e: any) => e.message)
              .join(", ")}`,
          );
        }

        const userData = result.data?.user;

        if (!userData) {
          // User hasn't made any transactions yet
          logger.log("📊 No user data found in subgraph");
          setTransactions([]);
          setPositions([]);
          setStats({
            totalInvested: BigInt(0),
            totalWithdrawn: BigInt(0),
            netPosition: BigInt(0),
            transactionCount: 0,
            marketsTraded: new Set(),
          });
          setIsLoading(false);
          return;
        }

        logger.log(`📊 Found ${userData.transactions.length} transactions`);

        // Parse transactions
        const parsedTransactions: UserTransaction[] = userData.transactions.map(
          (tx: any) => ({
            hash: tx.transactionHash,
            marketId: BigInt(tx.marketId),
            action: Number(tx.action) as MarketAction,
            actionLabel: tx.actionLabel,
            outcomeId: BigInt(tx.outcomeId),
            shares: BigInt(tx.shares),
            value: BigInt(tx.value),
            timestamp: Number(tx.timestamp),
            blockNumber: BigInt(tx.blockNumber),
          }),
        );

        // Parse positions
        const parsedPositions: OpenPosition[] = userData.positions.map(
          (pos: any) => ({
            marketId: pos.marketId,
            outcomeId: pos.outcomeId,
            shares: BigInt(pos.shares),
            totalBought: BigInt(pos.totalBought),
            totalSold: BigInt(pos.totalSold),
            invested: BigInt(pos.invested),
            receivedFromSells: BigInt(pos.receivedFromSells),
            avgEntryPrice: Number(pos.avgEntryPrice),
          }),
        );

        // Parse stats
        const parsedStats: TransactionStats = {
          totalInvested: BigInt(userData.totalInvested),
          totalWithdrawn: BigInt(userData.totalWithdrawn),
          netPosition: BigInt(userData.netPosition),
          transactionCount: userData.transactionCount,
          marketsTraded: new Set(userData.marketsTraded),
        };

        logger.log(`📈 Found ${parsedPositions.length} open positions`);

        setTransactions(parsedTransactions);
        setPositions(parsedPositions);
        setStats(parsedStats);
      } catch (err) {
        logger.error("❌ Error fetching user data from subgraph:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to fetch user data"),
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userAddress, refetchTrigger]);

  return {
    transactions,
    positions,
    stats,
    isLoading,
    error,
    refetch,
  };
}
