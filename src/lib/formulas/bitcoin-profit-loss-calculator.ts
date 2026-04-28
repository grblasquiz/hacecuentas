export interface Inputs {
  btc_amount: number;
  buy_price: number;
  sell_price: number;
  buy_fee_pct: number;
  sell_fee_pct: number;
  holding_days: number;
}

export interface Outputs {
  cost_basis: number;
  net_proceeds: number;
  profit_loss: number;
  pct_return: number;
  annualized_return: number;
  tax_term: string;
  breakeven_price: number;
}

export function compute(i: Inputs): Outputs {
  const btc = Math.max(Number(i.btc_amount) || 0, 0);
  const buyPrice = Math.max(Number(i.buy_price) || 0, 0);
  const sellPrice = Math.max(Number(i.sell_price) || 0, 0);
  // Fees: clamp to [0, 100] then convert to decimal
  const buyFeePct = Math.min(Math.max(Number(i.buy_fee_pct) || 0, 0), 100);
  const sellFeePct = Math.min(Math.max(Number(i.sell_fee_pct) || 0, 0), 100);
  const holdingDays = Math.max(Math.round(Number(i.holding_days) || 0), 0);

  // Defensive: require positive BTC amount and buy price
  if (btc <= 0 || buyPrice <= 0) {
    return {
      cost_basis: 0,
      net_proceeds: 0,
      profit_loss: 0,
      pct_return: 0,
      annualized_return: 0,
      tax_term: "Enter a valid BTC amount and buy price.",
      breakeven_price: 0,
    };
  }

  // Step 1: Cost Basis = (BTC × Buy Price) × (1 + buy fee as decimal)
  // Source: IRS Publication 544 — cost includes fees paid to acquire the asset
  const grossCost = btc * buyPrice;
  const buyFeeDecimal = buyFeePct / 100;
  const cost_basis = grossCost * (1 + buyFeeDecimal);

  // Step 2: Gross Proceeds = BTC × Sell Price
  const grossProceeds = btc * sellPrice;

  // Step 3: Net Proceeds = Gross Proceeds × (1 - sell fee as decimal)
  const sellFeeDecimal = sellFeePct / 100;
  const net_proceeds = grossProceeds * (1 - sellFeeDecimal);

  // Step 4: Profit / Loss
  const profit_loss = net_proceeds - cost_basis;

  // Step 5: Total Return %
  const pct_return = cost_basis > 0 ? (profit_loss / cost_basis) * 100 : 0;

  // Step 6: Annualized Return (CAGR)
  // Formula: (Net Proceeds / Cost Basis)^(365 / holding_days) - 1
  // Undefined / clamped when holding_days == 0 or ratio is negative
  let annualized_return = 0;
  if (holdingDays > 0 && cost_basis > 0 && net_proceeds > 0) {
    const ratio = net_proceeds / cost_basis;
    annualized_return = (Math.pow(ratio, 365 / holdingDays) - 1) * 100;
  } else if (holdingDays === 0 && cost_basis > 0) {
    // Same-day trade: annualized return is not meaningful
    annualized_return = pct_return;
  }

  // Step 7: Breakeven Sell Price
  // We need: BTC × breakeven × (1 - sellFee) = cost_basis
  // => breakeven = cost_basis / (BTC × (1 - sellFee))
  const sellFeeMultiplier = 1 - sellFeeDecimal;
  const breakeven_price =
    btc > 0 && sellFeeMultiplier > 0
      ? cost_basis / (btc * sellFeeMultiplier)
      : 0;

  // Step 8: Tax Term classification (U.S. IRS rules — long-term requires > 365 days)
  // Source: IRS Topic No. 409, IRS Notice 2014-21
  let tax_term: string;
  if (holdingDays === 0) {
    tax_term = "Same-day trade — short-term (ordinary income rates)";
  } else if (holdingDays <= 365) {
    tax_term = `Short-term (${holdingDays} day${holdingDays === 1 ? "" : "s"} ≤ 365) — taxed as ordinary income`;
  } else {
    tax_term = `Long-term (${holdingDays} days > 365) — 0%, 15%, or 20% preferential rates`;
  }

  return {
    cost_basis,
    net_proceeds,
    profit_loss,
    pct_return,
    annualized_return,
    tax_term,
    breakeven_price,
  };
}
