export interface Inputs {
  token: string;
  custom_apr: number;
  amount_staked: number;
  token_price_usd: number;
  period_months: number;
  compound_frequency: string;
  validator_commission: number;
}

export interface Outputs {
  net_apr: number;
  effective_apy: number;
  rewards_tokens: number;
  end_stake_tokens: number;
  rewards_usd: number;
  end_stake_usd: number;
  breakdown: string;
}

// Default gross APRs per token (typical 2025-2026 network estimates)
// Sources: Ethereum Foundation, Stakingrewards.com, network documentation
const TOKEN_APR: Record<string, number> = {
  eth: 0.035,   // Ethereum ~3.5%
  sol: 0.06,    // Solana ~6%
  ada: 0.03,    // Cardano ~3%
  atom: 0.14,   // Cosmos ~14%
  dot: 0.11,    // Polkadot ~11%
  custom: 0.08, // fallback if custom selected without value
};

const TOKEN_SYMBOL: Record<string, string> = {
  eth: "ETH",
  sol: "SOL",
  ada: "ADA",
  atom: "ATOM",
  dot: "DOT",
  custom: "tokens",
};

export function compute(i: Inputs): Outputs {
  const amountStaked = Number(i.amount_staked) || 0;
  const tokenPriceUsd = Number(i.token_price_usd) || 0;
  const periodMonths = Math.max(0, Math.round(Number(i.period_months) || 0));
  const commissionRate = Math.min(1, Math.max(0, (Number(i.validator_commission) || 0) / 100));
  const compoundFreqStr = String(i.compound_frequency ?? "12");
  const compoundN = parseInt(compoundFreqStr, 10); // 0 = simple interest
  const token = String(i.token || "sol").toLowerCase();

  // Resolve gross APR
  let grossApr: number;
  if (token === "custom") {
    grossApr = Math.max(0, (Number(i.custom_apr) || 0) / 100);
  } else {
    grossApr = TOKEN_APR[token] ?? 0.06;
  }

  const symbol = TOKEN_SYMBOL[token] ?? "tokens";

  // Guard: no stake or no price
  if (amountStaked <= 0) {
    return {
      net_apr: 0,
      effective_apy: 0,
      rewards_tokens: 0,
      end_stake_tokens: 0,
      rewards_usd: 0,
      end_stake_usd: 0,
      breakdown: "Enter a valid staking amount greater than zero.",
    };
  }

  // Net APR after validator commission
  const netApr = grossApr * (1 - commissionRate);

  // Time in years
  const t = periodMonths / 12;

  let endStakeTokens: number;
  let effectiveApy: number;

  if (compoundN <= 0) {
    // Simple interest: no compounding
    endStakeTokens = amountStaked * (1 + netApr * t);
    effectiveApy = netApr; // APY = APR when no compounding
  } else {
    // Compound interest
    endStakeTokens = amountStaked * Math.pow(1 + netApr / compoundN, compoundN * t);
    effectiveApy = Math.pow(1 + netApr / compoundN, compoundN) - 1;
  }

  const rewardsTokens = endStakeTokens - amountStaked;
  const rewardsUsd = rewardsTokens * tokenPriceUsd;
  const endStakeUsd = endStakeTokens * tokenPriceUsd;

  // Build human-readable summary
  const compoundLabel =
    compoundN === 0 ? "no compounding (simple interest)" :
    compoundN === 1 ? "annual compounding" :
    compoundN === 2 ? "semi-annual compounding" :
    compoundN === 4 ? "quarterly compounding" :
    compoundN === 12 ? "monthly compounding" :
    compoundN === 365 ? "daily compounding" :
    `${compoundN}×/year compounding`;

  const periodLabel = periodMonths === 1 ? "1 month" : `${periodMonths} months`;

  const breakdown =
    `Gross APR: ${(grossApr * 100).toFixed(2)}% | ` +
    `Commission: ${(commissionRate * 100).toFixed(1)}% | ` +
    `Net APR: ${(netApr * 100).toFixed(2)}% | ` +
    `Effective APY: ${(effectiveApy * 100).toFixed(3)}% | ` +
    `Over ${periodLabel} with ${compoundLabel}: ` +
    `${amountStaked.toLocaleString("en-US", { maximumFractionDigits: 4 })} ${symbol} → ` +
    `${endStakeTokens.toLocaleString("en-US", { maximumFractionDigits: 4 })} ${symbol} ` +
    `(+${rewardsTokens.toLocaleString("en-US", { maximumFractionDigits: 4 })} ${symbol} ≈ $${rewardsUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD at $${tokenPriceUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/${symbol}).`;

  return {
    net_apr: netApr,
    effective_apy: effectiveApy,
    rewards_tokens: rewardsTokens,
    end_stake_tokens: endStakeTokens,
    rewards_usd: rewardsUsd,
    end_stake_usd: endStakeUsd,
    breakdown,
  };
}
