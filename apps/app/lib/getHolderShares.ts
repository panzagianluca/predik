import Web3 from "web3";
import { logger } from "./logger";
// Use the official Polkamarkets ABI to avoid decode mismatches
// The package ships the full contract ABI, including read functions
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - JSON typed as any
import PM_FULL_ABI from "polkamarkets-js/abis/PredictionMarketV3_4.json";

export async function getHolderShares(
  marketId: number,
  holderAddress: string,
): Promise<{ liquidityShares: bigint; outcomeShares: bigint[] }> {
  const web3 = new Web3(
    process.env.NEXT_PUBLIC_RPC_URL || "https://bsc-dataseed.binance.org/",
  );

  const contract = new web3.eth.Contract(
    PM_FULL_ABI as any,
    process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS!,
  );

  try {
    const result = await contract.methods
      .getUserMarketShares(marketId, holderAddress)
      .call();

    // The official ABI defines tuple outputs; normalize both object/array forms
    // Possible shapes:
    // - { liquidityShares: string, outcomeShares: string[] }
    // - { liquidity: string, outcomes: string[] }
    // - [ liquidityShares, outcomeShares ]
    const liquidityRaw =
      (result?.liquidityShares as string) ??
      (result?.liquidity as string) ??
      (Array.isArray(result) ? (result[0] as string) : undefined);
    const outcomesRaw =
      (result?.outcomeShares as string[]) ??
      (result?.outcomes as string[]) ??
      (Array.isArray(result) ? (result[1] as string[]) : undefined);

    if (!liquidityRaw || !outcomesRaw) {
      throw new Error(
        "Unexpected getUserMarketShares result shape from contract read",
      );
    }

    return {
      liquidityShares: BigInt(liquidityRaw),
      outcomeShares: outcomesRaw.map((s) => BigInt(s)),
    };
  } catch (err) {
    logger.error(`Error fetching shares for ${holderAddress}:`, err);
    throw err;
  }
}
