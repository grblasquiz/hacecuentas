export interface Inputs {
  par: string;
  precioActual: number;
  precioMin: number;
  precioMax: number;
  capital: number;
  volumenDiario: number;
  feeTier: string;
  liquidezTotal: number;
  precioFinal: number;
}

export interface Outputs {
  apyEstimado: number;
  feesAnuales: number;
  feesDiarios: number;
  multiplicadorConcentracion: number;
  impermanentLoss: number;
  impermanentLossUSD: number;
  valorHodl: number;
  valorLP: number;
  breakeven: number;
  estadoRango: string;
}

export function compute(i: Inputs): Outputs {
  const precioActual = Number(i.precioActual) || 0;
  const precioMin = Number(i.precioMin) || 0;
  const precioMax = Number(i.precioMax) || 0;
  const capital = Number(i.capital) || 0;
  const volumenDiario = Number(i.volumenDiario) || 0;
  const liquidezTotal = Number(i.liquidezTotal) || 0;
  const precioFinal = Number(i.precioFinal) || 0;
  const feeTier = Number(i.feeTier) || 0.003;

  const DAYS_PER_YEAR = 365;

  // Basic validation
  if (
    precioActual <= 0 ||
    precioMin <= 0 ||
    precioMax <= 0 ||
    precioMin >= precioMax ||
    capital <= 0 ||
    volumenDiario <= 0 ||
    liquidezTotal <= 0 ||
    precioFinal <= 0
  ) {
    return {
      apyEstimado: 0,
      feesAnuales: 0,
      feesDiarios: 0,
      multiplicadorConcentracion: 0,
      impermanentLoss: 0,
      impermanentLossUSD: 0,
      valorHodl: capital,
      valorLP: capital,
      breakeven: 0,
      estadoRango: "Revisá los valores ingresados",
    };
  }

  // Validate price is within range
  if (precioActual < precioMin || precioActual > precioMax) {
    return {
      apyEstimado: 0,
      feesAnuales: 0,
      feesDiarios: 0,
      multiplicadorConcentracion: 0,
      impermanentLoss: 0,
      impermanentLossUSD: 0,
      valorHodl: capital,
      valorLP: capital,
      breakeven: 0,
      estadoRango: "El precio actual debe estar dentro del rango [min, max]",
    };
  }

  // --- Concentration Multiplier ---
  // Based on Uniswap V3 whitepaper: liquidity amplification vs full-range
  // Formula derived from virtual reserve math with sqrt prices
  const sqrtP = Math.sqrt(precioActual);
  const sqrtPa = Math.sqrt(precioMin);
  const sqrtPb = Math.sqrt(precioMax);

  // Factor from lower bound (token0 / base asset side)
  const factorLower = sqrtP / (sqrtP - sqrtPa);
  // Factor from upper bound (token1 / quote asset side)
  const factorUpper = sqrtPb / (sqrtPb - sqrtP);

  // The effective concentration multiplier is the minimum of both factors
  // (the binding constraint depends on which asset is more scarce)
  const multiplicadorConcentracion = Math.min(factorLower, factorUpper);

  // --- Fee Estimation ---
  // Effective capital in pool terms
  const capitalEfectivo = capital * multiplicadorConcentracion;
  // Share of pool (own effective capital / total pool liquidity + own effective capital)
  const sharePool = capitalEfectivo / (liquidezTotal + capitalEfectivo);
  // Daily fees earned
  const feesDiarios = volumenDiario * feeTier * sharePool;
  const feesAnuales = feesDiarios * DAYS_PER_YEAR;
  const apyEstimado = capital > 0 ? feesAnuales / capital : 0;

  // --- Impermanent Loss Calculation ---
  // Determine state of final price relative to range
  let estadoRango: string;
  let valorLP: number;
  let valorHodl: number;

  // We assume initial deposit was 50/50 in USD value terms (standard entry at midpoint)
  // Initial token0 quantity: (capital / 2) / precioActual
  // Initial token1 quantity: capital / 2
  const token0Init = (capital / 2) / precioActual; // units of base asset
  const token1Init = capital / 2; // units of quote (USD stablecoin)

  // HODL value at final price
  valorHodl = token0Init * precioFinal + token1Init;

  if (precioFinal >= precioMin && precioFinal <= precioMax) {
    // Price is IN range
    estadoRango = "Dentro del rango — posición activa, generando fees";

    // Uniswap V3 in-range IL is equivalent to V2 for the virtual position
    // Using standard V2 IL formula with price ratio k = sqrt(pf/p0)
    // LP value relative to initial capital:
    // valorLP = capital * 2*sqrt(pf/p0) / (1 + pf/p0)  [exact V2 formula]
    const ratio = precioFinal / precioActual;
    const sqrtRatio = Math.sqrt(ratio);
    valorLP = capital * (2 * sqrtRatio) / (1 + ratio);

  } else if (precioFinal < precioMin) {
    // Price is BELOW range: all liquidity converted to base asset (e.g. ETH)
    estadoRango = "Por debajo del rango — posición inactiva, todo en activo base";

    // When price falls below pa, LP holds only token0 at price pa value
    // Approximation: value = capital * sqrt(pa * pf) / p0
    // More precisely: L * (sqrt(pb) - sqrt(pa)) * pf converted to USD at pf
    // We use: the position fully converted to token0 at pa,
    // then valued at pf
    // Simplified: valorLP = capital * sqrt(precioFinal / precioActual) * sqrt(precioMin / precioActual)
    // = capital * sqrt(precioMin * precioFinal) / precioActual
    valorLP = capital * Math.sqrt(precioMin * precioFinal) / precioActual;

  } else {
    // Price is ABOVE range: all liquidity converted to quote asset (e.g. USDC)
    estadoRango = "Por encima del rango — posición inactiva, todo en activo quote";

    // When price rises above pb, LP holds only token1 (stablecoin)
    // Value is fixed at pb in terms of token0
    // Approximation: valorLP = capital * sqrt(precioMax / precioActual)
    valorLP = capital * Math.sqrt(precioMax / precioActual);
  }

  // IL = (valorLP - valorHodl) / valorHodl
  const impermanentLossUSD = valorLP - valorHodl;
  const impermanentLoss = valorHodl > 0 ? impermanentLossUSD / valorHodl : 0;

  // Breakeven: days of fees to cover the IL loss
  const absILUSD = Math.abs(impermanentLossUSD);
  const breakeven = feesDiarios > 0 && absILUSD > 0 ? Math.ceil(absILUSD / feesDiarios) : 0;

  return {
    apyEstimado,
    feesAnuales,
    feesDiarios,
    multiplicadorConcentracion,
    impermanentLoss,
    impermanentLossUSD,
    valorHodl,
    valorLP,
    breakeven,
    estadoRango,
  };
}
