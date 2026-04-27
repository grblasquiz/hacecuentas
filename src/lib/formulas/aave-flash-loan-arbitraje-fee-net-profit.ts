export interface Inputs {
  loanAmount: number;
  spreadPct: number;
  gasUnits: number;
  gasPriceGwei: number;
  ethUsd: number;
  slippagePct: number;
}

export interface Outputs {
  grossProfit: number;
  aaveFee: number;
  gasCostUsd: number;
  slippageCost: number;
  netProfit: number;
  breakevenGwei: number;
  roiPct: number;
  verdict: string;
}

export function compute(i: Inputs): Outputs {
  const loanAmount = Number(i.loanAmount) || 0;
  const spreadPct = Number(i.spreadPct) || 0;
  const gasUnits = Number(i.gasUnits) || 200000;
  const gasPriceGwei = Number(i.gasPriceGwei) || 0;
  const ethUsd = Number(i.ethUsd) || 0;
  const slippagePct = Number(i.slippagePct) || 0;

  // Validate critical inputs
  if (loanAmount <= 0 || ethUsd <= 0) {
    return {
      grossProfit: 0,
      aaveFee: 0,
      gasCostUsd: 0,
      slippageCost: 0,
      netProfit: 0,
      breakevenGwei: 0,
      roiPct: 0,
      verdict: "Ingresa un monto de loan y precio de ETH válidos.",
    };
  }

  // --- Constants ---
  // Aave v3 flash loan fee: 0.05% (5 bps) — docs.aave.com/developers/guides/flash-loans
  const AAVE_FEE_RATE = 0.0005;

  // --- Core calculations ---
  const grossProfit = loanAmount * (spreadPct / 100);

  const aaveFee = loanAmount * AAVE_FEE_RATE;

  const slippageCost = loanAmount * (slippagePct / 100);

  // Gas cost: gasUnits × gasPriceGwei × 1e-9 (gwei→ETH) × ethUsd (ETH→USD)
  const gasCostUsd = gasUnits * gasPriceGwei * 1e-9 * ethUsd;

  const netProfit = grossProfit - aaveFee - slippageCost - gasCostUsd;

  // Breakeven gas price: the max gwei at which the trade is still profitable
  // (grossProfit - aaveFee - slippageCost) = gasUnits × breakevenGwei × 1e-9 × ethUsd
  const profitBeforeGas = grossProfit - aaveFee - slippageCost;
  const gasDivisor = gasUnits * 1e-9 * ethUsd;
  const breakevenGwei = gasDivisor > 0 ? profitBeforeGas / gasDivisor : 0;

  // ROI over loan principal
  const roiPct = (netProfit / loanAmount) * 100;

  // --- Verdict ---
  let verdict: string;
  if (spreadPct <= 0) {
    verdict = "Sin spread no hay profit posible. Revisá los precios entre exchanges.";
  } else if (netProfit > 0) {
    const margin = ((netProfit / grossProfit) * 100).toFixed(1);
    verdict = `Trade rentable. Profit neto USD ${netProfit.toFixed(2)} (${margin}% del gross). Gas máximo tolerable: ${breakevenGwei.toFixed(1)} gwei.`;
  } else if (profitBeforeGas > 0) {
    verdict = `Gas demasiado alto. Necesitás ≤ ${breakevenGwei.toFixed(1)} gwei para ser rentable (actual: ${gasPriceGwei} gwei).`;
  } else {
    verdict = `Spread insuficiente para cubrir la fee de Aave (${(AAVE_FEE_RATE * 100).toFixed(2)}%) y el slippage. Necesitás un spread mayor al ${((aaveFee + slippageCost) / loanAmount * 100).toFixed(3)}%.`;
  }

  return {
    grossProfit,
    aaveFee,
    gasCostUsd,
    slippageCost,
    netProfit,
    breakevenGwei,
    roiPct,
    verdict,
  };
}
