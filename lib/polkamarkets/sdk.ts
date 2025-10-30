// Polkamarkets SDK wrapper
import * as polkamarketsjs from 'polkamarkets-js'

const PM_CONTRACT = process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS || ''
const PM_QUERIER = process.env.NEXT_PUBLIC_PREDICTION_MARKET_QUERIER || ''
const REFERRAL_CODE = process.env.NEXT_PUBLIC_POLKAMARKETS_REFERRAL_CODE || 'predik'

export function createPolkamarketsInstance(provider: any) {
  return new polkamarketsjs.Application({
    web3Provider: provider,
  })
}

export function getPredictionMarketContract(polkamarkets: any) {
  return polkamarkets.getPredictionMarketV3PlusContract({
    contractAddress: PM_CONTRACT,
    querierContractAddress: PM_QUERIER,
  })
}

export function getERC20Contract(polkamarkets: any, tokenAddress: string) {
  return polkamarkets.getERC20Contract({
    contractAddress: tokenAddress,
  })
}

// Export constants for easy access
export const CONTRACTS = {
  PREDICTION_MARKET: PM_CONTRACT,
  PREDICTION_MARKET_QUERIER: PM_QUERIER,
  USDT: process.env.NEXT_PUBLIC_USDT_TOKEN_ADDRESS || '',
}

export const CONFIG = {
  REFERRAL_CODE,
  CHAIN_ID: 56,
  NETWORK_ID: 56,
}
