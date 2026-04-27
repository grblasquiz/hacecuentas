export interface Inputs {
  eth_amount: number;
  days: number;
  avs_count: string;
  scenario: string;
  eigen_price_usd: number;
  eth_price_usd: number;
}

export interface Outputs {
  total_points: number;
  eigen_tokens: number;
  airdrop_usd: number;
  validator_yield_usd: number;
  restaking_premium_usd: number;
  roi_restaking_pct: number;
  summary: string;
}

export function compute(i: Inputs): Outputs {
  // --- Parse & validate inputs ---
  const eth = Math.max(0, Number(i.eth_amount) || 0);
  const days = Math.max(0, Math.round(Number(i.days) || 0));
  const avsCount = Math.max(1, parseInt(i.avs_count, 10) || 1);
  const eigenPrice = Math.max(0, Number(i.eigen_price_usd) || 0);
  const ethPrice = Math.max(0, Number(i.eth_price_usd) || 0);
  const scenario = i.scenario || "base";

  if (eth <= 0 || days <= 0) {
    return {
      total_points: 0,
      eigen_tokens: 0,
      airdrop_usd: 0,
      validator_yield_usd: 0,
      restaking_premium_usd: 0,
      roi_restaking_pct: 0,
      summary: "Ingresá un monto de ETH y cantidad de días válidos.",
    };
  }

  // --- Step 1: Base points ---
  // EigenLayer canonical rate: 1 point per ETH per hour
  // Source: docs.eigenlayer.xyz
  const HOURS_PER_DAY = 24;
  const basePoints = eth * days * HOURS_PER_DAY;

  // --- Step 2: AVS multiplier ---
  // Each additional AVS beyond the first adds ~5% to point weight, capped at +50%
  // Based on Season 2 operator bonus observations
  const AVS_BONUS_PER_UNIT = 0.05;
  const AVS_BONUS_CAP = 1.50;
  const avsMultiplier = Math.min(1 + (avsCount - 1) * AVS_BONUS_PER_UNIT, AVS_BONUS_CAP);
  const totalPoints = basePoints * avsMultiplier;

  // --- Step 3: Points → EIGEN conversion ratio by scenario ---
  // Conservative: 0.04  (high dilution, Season-2 adjusted)
  // Base:         0.08  (average across S1+S2)
  // Optimistic:   0.15  (S1 early-adopter rate)
  // Source: Eigen Foundation Season 1 & 2 distribution data
  const CONVERSION_RATIOS: Record<string, number> = {
    conservative: 0.04,
    base: 0.08,
    optimistic: 0.15,
  };
  const conversionRatio = CONVERSION_RATIOS[scenario] ?? CONVERSION_RATIOS["base"];
  const eigenTokens = totalPoints * conversionRatio;

  // --- Step 4: USD valuation of airdrop ---
  const airdropUsd = eigenTokens * eigenPrice;

  // --- Step 5: Validator-only baseline yield ---
  // Ethereum staking APY ~3.5% annualized (beaconcha.in, 2025-2026 average)
  const VALIDATOR_APY = 0.035;
  const ethCapital = eth * ethPrice;
  const validatorYieldUsd = ethCapital * VALIDATOR_APY * (days / 365);

  // --- Step 6: Restaking premium & incremental ROI ---
  const restakingPremiumUsd = airdropUsd;
  // Annualized incremental ROI over the ETH capital
  const roiRestakingPct =
    ethCapital > 0 ? (restakingPremiumUsd / ethCapital) * (365 / days) : 0;

  // --- Summary text ---
  const scenarioLabel: Record<string, string> = {
    conservative: "conservador",
    base: "base",
    optimistic: "optimista",
  };
  const label = scenarioLabel[scenario] ?? scenario;
  const summary =
    `Escenario ${label}: ${eth} ETH × ${days} días × ${avsCount} AVS → ` +
    `${totalPoints.toLocaleString("en-US", { maximumFractionDigits: 0 })} points → ` +
    `${eigenTokens.toFixed(2)} EIGEN (~$${airdropUsd.toFixed(2)} USD). ` +
    `Prima vs. validador solo: +$${restakingPremiumUsd.toFixed(2)} USD ` +
    `(ROI incremental anualizado ${(roiRestakingPct * 100).toFixed(2)}%).`;

  return {
    total_points: Math.round(totalPoints),
    eigen_tokens: eigenTokens,
    airdrop_usd: airdropUsd,
    validator_yield_usd: validatorYieldUsd,
    restaking_premium_usd: restakingPremiumUsd,
    roi_restaking_pct: roiRestakingPct,
    summary,
  };
}
