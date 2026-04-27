export interface Inputs {
  exchange: string;
  side: string;
  entryPrice: number;
  leverage: number;
  maintenanceMarginPct: number;
  fundingRate8h: number;
  positionSizeUSD: number;
}

export interface Outputs {
  liquidationPrice: number;
  distancePct: number;
  funding8hUSD: number;
  fundingDailyUSD: number;
  fundingWeeklyUSD: number;
  daysToFundingDrain: number;
  initialMarginUSD: number;
  summary: string;
}

export function compute(i: Inputs): Outputs {
  const entryPrice = Number(i.entryPrice) || 0;
  const leverage = Math.min(Math.max(Number(i.leverage) || 1, 1), 100);
  const maintenanceMarginPct = Math.max(Number(i.maintenanceMarginPct) || 0, 0);
  const fundingRate8h = Number(i.fundingRate8h) || 0;
  const positionSizeUSD = Math.max(Number(i.positionSizeUSD) || 0, 0);
  const side = (i.side || "long").toLowerCase();
  const exchange = (i.exchange || "binance").toLowerCase();

  if (entryPrice <= 0 || positionSizeUSD <= 0) {
    return {
      liquidationPrice: 0,
      distancePct: 0,
      funding8hUSD: 0,
      fundingDailyUSD: 0,
      fundingWeeklyUSD: 0,
      daysToFundingDrain: 0,
      initialMarginUSD: 0,
      summary: "Ingresá un precio de entrada y tamaño de posición válidos.",
    };
  }

  // Funding intervals by exchange (payments per day)
  // Binance and Bybit: 3x per day (every 8h)
  // Hyperliquid: 24x per day (every 1h), but rate is expressed as 8h-equivalent
  const FUNDING_PERIODS_PER_DAY: Record<string, number> = {
    binance: 3,
    bybit: 3,
    hyperliquid: 24, // hourly, rate already expressed per-8h normalized
  };
  const fundingPeriodsPerDay = FUNDING_PERIODS_PER_DAY[exchange] ?? 3;

  // Initial margin (USD)
  const initialMarginUSD = positionSizeUSD / leverage;

  // Maintenance margin fraction
  const mmFraction = maintenanceMarginPct / 100;

  // Liquidation price formula (isolated margin, single position)
  // Long:  LiqPrice = entryPrice * (1 - 1/leverage + mmFraction)
  // Short: LiqPrice = entryPrice * (1 + 1/leverage - mmFraction)
  let liquidationPrice: number;
  if (side === "long") {
    liquidationPrice = entryPrice * (1 - 1 / leverage + mmFraction);
  } else {
    liquidationPrice = entryPrice * (1 + 1 / leverage - mmFraction);
  }

  // Ensure liquidation price is non-negative
  liquidationPrice = Math.max(liquidationPrice, 0);

  // Distance from entry to liquidation (%)
  const distancePct = entryPrice > 0
    ? (Math.abs(entryPrice - liquidationPrice) / entryPrice) * 100
    : 0;

  // Funding cost per 8h period (USD)
  // Positive funding rate: longs pay shorts; negative: shorts pay longs
  // For longs, positive rate = cost; for shorts, positive rate = income
  const fundingRate8hFraction = fundingRate8h / 100;

  // Raw funding per 8h period on notional
  const fundingRaw8h = positionSizeUSD * fundingRate8hFraction;

  // Sign: long pays when positive, short receives when positive
  const fundingSign = side === "long" ? 1 : -1;
  const funding8hUSD = fundingSign * fundingRaw8h;

  // Daily and weekly funding
  // For Hyperliquid, funding is charged hourly (24x/day) but rate is per-8h equivalent
  // So daily = rate_8h * 3 (same as 8h-interval exchanges) when rate is normalized to 8h
  // The periods per day only matter if the rate given is per-period (not per-8h normalized)
  // Convention here: fundingRate8h is always per-8h equivalent, so daily = 3 periods worth
  const fundingDailyUSD = funding8hUSD * 3;
  const fundingWeeklyUSD = fundingDailyUSD * 7;

  // Days until funding drains initial margin
  // Only meaningful if funding is a cost (positive for long, negative for short means income)
  let daysToFundingDrain = 0;
  const dailyCostAbs = Math.abs(fundingDailyUSD);
  if (dailyCostAbs > 0 && funding8hUSD > 0) {
    // Funding is a net cost for this position
    daysToFundingDrain = initialMarginUSD / dailyCostAbs;
  } else if (dailyCostAbs === 0) {
    daysToFundingDrain = Infinity;
  } else {
    // Funding is income for this side — no drain
    daysToFundingDrain = Infinity;
  }

  // Build summary string
  const sideLabel = side === "long" ? "Long" : "Short";
  const exchangeLabel =
    exchange === "binance" ? "Binance" :
    exchange === "bybit" ? "Bybit" :
    exchange === "hyperliquid" ? "Hyperliquid" : exchange;

  const liqFormatted = liquidationPrice.toFixed(2);
  const distFormatted = distancePct.toFixed(2);
  const fundingDailyFormatted = fundingDailyUSD.toFixed(4);
  const drainText =
    daysToFundingDrain === Infinity || daysToFundingDrain <= 0
      ? "el funding es ingreso para esta posición"
      : `margen inicial se drena por funding en ~${daysToFundingDrain.toFixed(0)} días`;

  const summary =
    `${sideLabel} ${leverage}x en ${exchangeLabel} | Entrada: $${entryPrice.toFixed(2)} → Liquidación: $${liqFormatted} (${distFormatted}% de distancia) | Funding diario: ${fundingDailyFormatted} USD | ${drainText}.`;

  return {
    liquidationPrice,
    distancePct,
    funding8hUSD,
    fundingDailyUSD,
    fundingWeeklyUSD,
    daysToFundingDrain: daysToFundingDrain === Infinity ? 9999 : daysToFundingDrain,
    initialMarginUSD,
    summary,
  };
}
