"use client";

import { useAccount } from "wagmi";
import { useUserTransactions } from "@/hooks/use-user-transactions";
import { Card } from "@/components/ui/card";
import { useEffect } from "react";

export function ProfileDebug() {
  const { address } = useAccount();
  const { transactions, positions, stats, isLoading, error } =
    useUserTransactions(address);

  useEffect(() => {
    console.log("🔍 Profile Debug Info:", {
      address,
      addressLowercase: address?.toLowerCase(),
      subgraphUrl: process.env.NEXT_PUBLIC_SUBGRAPH_URL,
      isLoading,
      error: error?.message,
      transactionCount: transactions.length,
      positionCount: positions.length,
      stats,
    });
  }, [address, transactions, positions, stats, isLoading, error]);

  if (!address) {
    return (
      <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <p className="text-sm">❌ No wallet connected</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
      <div className="space-y-2 text-sm">
        <p className="font-semibold">🔍 Debug Info</p>
        <div className="space-y-1">
          <p>
            <strong>Address:</strong> {address}
          </p>
          <p>
            <strong>Lowercase:</strong> {address.toLowerCase()}
          </p>
          <p>
            <strong>Subgraph:</strong>{" "}
            {process.env.NEXT_PUBLIC_SUBGRAPH_URL || "❌ NOT SET"}
          </p>
          <p>
            <strong>Loading:</strong> {isLoading ? "⏳ Yes" : "✅ No"}
          </p>
          <p>
            <strong>Error:</strong> {error ? `❌ ${error.message}` : "✅ None"}
          </p>
          <p>
            <strong>Transactions:</strong> {transactions.length}
          </p>
          <p>
            <strong>Positions:</strong> {positions.length}
          </p>
          <p>
            <strong>Transaction Count (Stats):</strong> {stats.transactionCount}
          </p>
          <p>
            <strong>Total Invested:</strong> {stats.totalInvested.toString()}{" "}
            wei
          </p>
        </div>

        <div className="mt-4 p-2 bg-white dark:bg-gray-800 rounded border">
          <p className="font-semibold mb-2">Test Query:</p>
          <code className="text-xs block whitespace-pre-wrap break-all">
            {`curl -X POST "${process.env.NEXT_PUBLIC_SUBGRAPH_URL}" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "{ user(id: \\"${address.toLowerCase()}\\") { address transactionCount } }"}'`}
          </code>
        </div>
      </div>
    </Card>
  );
}
