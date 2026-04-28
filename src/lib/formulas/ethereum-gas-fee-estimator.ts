export interface Inputs {
  tx_type: string;
  gas_price_gwei: number;
  eth_price_usd: number;
}

export interface Outputs {
  gas_used: number;
  fee_eth: number;
  fee_usd: number;
  l2_fee_usd: number;
  l2_savings_usd: number;
  summary: string;
}

// Gas units per transaction type — typical medians (Ethereum Foundation docs, 2026)
const GAS_UNITS: Record<string, number> = {
  eth_transfer: 21000,
  erc20_transfer: 65000,
  uniswap_swap: 150000,
  nft_mint: 200000,
  defi_complex: 500000,
};

// Representative L2 midpoint fees (USD) per tx type — Arbitrum/Base, 2026
// Source: L2Beat, Arbitrum One fee data
const L2_FEE_USD: Record<string, number> = {
  eth_transfer: 0.03,
  erc20_transfer: 0.08,
  uniswap_swap: 0.20,
  nft_mint: 0.25,
  defi_complex: 0.40,
};

const GWEI_TO_ETH = 1e-9; // 1 gwei = 10^-9 ETH

export function compute(i: Inputs): Outputs {
  const txType = i.tx_type || "eth_transfer";
  const gasPriceGwei = Number(i.gas_price_gwei) || 0;
  const ethPriceUsd = Number(i.eth_price_usd) || 0;

  // Validate inputs
  if (gasPriceGwei <= 0 || ethPriceUsd <= 0) {
    return {
      gas_used: 0,
      fee_eth: 0,
      fee_usd: 0,
      l2_fee_usd: 0,
      l2_savings_usd: 0,
      summary: "Enter a valid gas price (gwei) and ETH price to calculate fees.",
    };
  }

  const gasUsed = GAS_UNITS[txType] ?? GAS_UNITS["eth_transfer"];
  const l2Fee = L2_FEE_USD[txType] ?? L2_FEE_USD["eth_transfer"];

  // Core formula: Fee (ETH) = gasUsed × gasPriceGwei × 10^-9
  const feeEth = gasUsed * gasPriceGwei * GWEI_TO_ETH;
  const feeUsd = feeEth * ethPriceUsd;

  const l2SavingsUsd = Math.max(0, feeUsd - l2Fee);

  // Human-readable tx type label
  const txLabels: Record<string, string> = {
    eth_transfer: "ETH Transfer",
    erc20_transfer: "ERC-20 Transfer",
    uniswap_swap: "Uniswap Swap",
    nft_mint: "NFT Mint",
    defi_complex: "Complex DeFi",
  };
  const txLabel = txLabels[txType] ?? txType;

  const savingsNote =
    l2SavingsUsd > 0.01
      ? ` An L2 like Arbitrum or Base would cost ~$${l2Fee.toFixed(2)}, saving you ~$${l2SavingsUsd.toFixed(2)}.`
      : " L2 savings are minimal for this fee level.";

  const summary =
    `${txLabel} at ${gasPriceGwei} gwei and $${ethPriceUsd.toLocaleString("en-US")} ETH: ` +
    `${feeEth.toFixed(8)} ETH ($${feeUsd.toFixed(4)} USD).` +
    savingsNote;

  return {
    gas_used: gasUsed,
    fee_eth: feeEth,
    fee_usd: feeUsd,
    l2_fee_usd: l2Fee,
    l2_savings_usd: l2SavingsUsd,
    summary,
  };
}
