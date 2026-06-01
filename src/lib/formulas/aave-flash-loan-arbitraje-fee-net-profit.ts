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
  _chart?: any;
  _insight?: any;
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

  // Donut: desglose del profit bruto en fees, costos y profit neto.
  // Solo tiene sentido cuando hay profit neto positivo (todas las partes ≥ 0).
  let chart: any = undefined;
  if (grossProfit > 0 && netProfit > 0) {
    chart = {
      type: 'doughnut' as const,
      slices: [
        { label: 'Profit neto', value: netProfit },
        { label: 'Fee Aave', value: aaveFee },
        { label: 'Slippage', value: slippageCost },
        { label: 'Gas', value: gasCostUsd },
      ].filter((s) => s.value > 0),
      prefix: '$',
      centerValue: '$' + Math.round(grossProfit).toLocaleString('es-AR'),
      centerLabel: 'Profit bruto',
      ariaLabel: 'Composición del profit bruto: profit neto, fee de Aave, slippage y gas.',
    };
  }

  // Insight narrativo: interpreta el profit neto y los costos que se comen el gross.
  const totalCostos = aaveFee + slippageCost + gasCostUsd;
  let insight: any;
  if (spreadPct <= 0) {
    insight = {
      title: 'Sin spread, sin arbitraje',
      text: `Con **0% de spread** no hay diferencia de precio que capturar. El flash loan no genera ganancia: revisá los precios entre exchanges.`,
      tone: 'warn' as const,
      icon: '⚡',
    };
  } else if (netProfit > 0) {
    const margenPct = (netProfit / grossProfit) * 100;
    insight = {
      title: 'Arbitraje rentable',
      text: `Después de fee de Aave, slippage y gas, te quedan **$${netProfit.toFixed(2)}** netos: el **${margenPct.toFixed(1)}%** del profit bruto. Aguantás gas hasta **${breakevenGwei.toFixed(1)} gwei** antes de quedar en cero.`,
      tone: 'good' as const,
      icon: '✅',
    };
  } else if (profitBeforeGas > 0) {
    insight = {
      title: 'El gas se come la ganancia',
      text: `El spread cubre fee y slippage, pero a **${gasPriceGwei} gwei** el gas ($${gasCostUsd.toFixed(2)}) deja el trade en **$${netProfit.toFixed(2)}**. Necesitás gas **≤ ${breakevenGwei.toFixed(1)} gwei** para que dé positivo.`,
      tone: 'warn' as const,
      icon: '⛽',
    };
  } else {
    insight = {
      title: 'Spread insuficiente',
      text: `Los costos (**$${totalCostos.toFixed(2)}** entre fee, slippage y gas) superan el profit bruto de **$${grossProfit.toFixed(2)}**. El trade pierde **$${Math.abs(netProfit).toFixed(2)}**: necesitás un spread mayor.`,
      tone: 'warn' as const,
      icon: '🔻',
    };
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
    _chart: chart,
    _insight: insight,
  };
}
