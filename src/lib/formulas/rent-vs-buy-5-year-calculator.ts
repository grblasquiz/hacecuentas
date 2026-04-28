export interface Inputs {
  home_price: number;
  down_payment_pct: number;
  mortgage_rate: number;
  loan_term_years: string;
  property_tax_rate: number;
  home_insurance_annual: number;
  hoa_monthly: number;
  maintenance_rate: number;
  buy_closing_cost_pct: number;
  sell_closing_cost_pct: number;
  appreciation_rate: number;
  monthly_rent: number;
  rent_inflation: number;
  investment_return: number;
}

export interface Outputs {
  buy_net_cost_5yr: number;
  rent_net_cost_5yr: number;
  difference_5yr: number;
  breakeven_year: string;
  monthly_mortgage_payment: number;
  home_value_5yr: number;
  equity_5yr: number;
  summary: string;
}

// Helper: compute outstanding loan balance after `paymentsMade` payments
function loanBalance(
  principal: number,
  monthlyRate: number,
  totalPayments: number,
  paymentsMade: number
): number {
  if (monthlyRate === 0) {
    return principal * (1 - paymentsMade / totalPayments);
  }
  const factor = Math.pow(1 + monthlyRate, totalPayments);
  const factorRemaining = Math.pow(1 + monthlyRate, paymentsMade);
  return principal * (factor - factorRemaining) / (factor - 1);
}

// Helper: compute net buy cost after Y years
function buyNetCostAtYear(
  homePrice: number,
  downPayment: number,
  buyClosingCosts: number,
  monthlyPI: number,
  propertyTaxRate: number, // decimal
  insuranceAnnual: number,
  hoaMonthly: number,
  maintenanceRate: number, // decimal
  appreciationRate: number, // decimal
  sellClosingCostPct: number, // decimal
  monthlyRate: number,
  totalLoanPayments: number,
  loanAmount: number,
  years: number
): number {
  let totalPaid = downPayment + buyClosingCosts;
  let homeValue = homePrice;

  for (let y = 1; y <= years; y++) {
    const prevValue = homeValue;
    homeValue = homePrice * Math.pow(1 + appreciationRate, y);

    totalPaid += monthlyPI * 12;
    totalPaid += prevValue * propertyTaxRate;
    totalPaid += prevValue * maintenanceRate;
    totalPaid += insuranceAnnual;
    totalPaid += hoaMonthly * 12;
  }

  const salePrice = homeValue;
  const sellCosts = salePrice * sellClosingCostPct;
  const paymentsMade = years * 12;
  const remainingBalance = loanBalance(loanAmount, monthlyRate, totalLoanPayments, paymentsMade);
  const equityNet = salePrice - sellCosts - remainingBalance;

  return totalPaid - equityNet;
}

// Helper: compute net rent cost after Y years
function rentNetCostAtYear(
  monthlyRent: number,
  rentInflation: number, // decimal
  downPayment: number,
  investmentReturn: number, // decimal
  years: number
): number {
  let totalRent = 0;
  for (let y = 1; y <= years; y++) {
    const annualRent = monthlyRent * 12 * Math.pow(1 + rentInflation, y - 1);
    totalRent += annualRent;
  }
  const opportunityCost = downPayment * (Math.pow(1 + investmentReturn, years) - 1);
  return totalRent - opportunityCost;
}

export function compute(i: Inputs): Outputs {
  const ANALYSIS_YEARS = 5;
  const BREAKEVEN_MAX_YEARS = 15;

  // --- Parse inputs defensively ---
  const homePrice = Math.max(Number(i.home_price) || 0, 0);
  const downPaymentPct = Math.min(Math.max(Number(i.down_payment_pct) || 10, 0), 100);
  const mortgageRatePct = Math.max(Number(i.mortgage_rate) || 6.8, 0);
  const loanTermYears = parseInt(String(i.loan_term_years) || "30", 10) || 30;
  const propertyTaxRatePct = Math.max(Number(i.property_tax_rate) || 1.1, 0);
  const insuranceAnnual = Math.max(Number(i.home_insurance_annual) || 1500, 0);
  const hoaMonthly = Math.max(Number(i.hoa_monthly) || 0, 0);
  const maintenanceRatePct = Math.max(Number(i.maintenance_rate) || 1.0, 0);
  const buyClosingCostPct = Math.max(Number(i.buy_closing_cost_pct) || 3.0, 0);
  const sellClosingCostPct = Math.max(Number(i.sell_closing_cost_pct) || 6.0, 0);
  const appreciationRatePct = Number(i.appreciation_rate) ?? 3.5;
  const monthlyRent = Math.max(Number(i.monthly_rent) || 0, 0);
  const rentInflationPct = Math.max(Number(i.rent_inflation) || 3.0, 0);
  const investmentReturnPct = Math.max(Number(i.investment_return) || 7.0, 0);

  if (homePrice <= 0 || monthlyRent <= 0) {
    return {
      buy_net_cost_5yr: 0,
      rent_net_cost_5yr: 0,
      difference_5yr: 0,
      breakeven_year: "Enter valid home price and rent",
      monthly_mortgage_payment: 0,
      home_value_5yr: 0,
      equity_5yr: 0,
      summary: "Please enter a home price and monthly rent to run the comparison."
    };
  }

  // --- Convert rates to decimals ---
  const monthlyRate = mortgageRatePct / 100 / 12;
  const appreciationRate = appreciationRatePct / 100;
  const rentInflation = rentInflationPct / 100;
  const investmentReturn = investmentReturnPct / 100;
  const propertyTaxRate = propertyTaxRatePct / 100;
  const maintenanceRate = maintenanceRatePct / 100;
  const sellFraction = sellClosingCostPct / 100;
  const buyClosingFraction = buyClosingCostPct / 100;

  // --- Derived values ---
  const downPayment = homePrice * (downPaymentPct / 100);
  const loanAmount = homePrice - downPayment;
  const totalLoanPayments = loanTermYears * 12;
  const buyClosingCosts = homePrice * buyClosingFraction;

  // --- Monthly P&I payment ---
  let monthlyPI: number;
  if (monthlyRate === 0) {
    monthlyPI = loanAmount / totalLoanPayments;
  } else {
    const factor = Math.pow(1 + monthlyRate, totalLoanPayments);
    monthlyPI = loanAmount * monthlyRate * factor / (factor - 1);
  }

  // --- 5-Year buy net cost ---
  const buyNetCost5 = buyNetCostAtYear(
    homePrice, downPayment, buyClosingCosts,
    monthlyPI, propertyTaxRate, insuranceAnnual, hoaMonthly,
    maintenanceRate, appreciationRate, sellFraction,
    monthlyRate, totalLoanPayments, loanAmount,
    ANALYSIS_YEARS
  );

  // --- 5-Year rent net cost ---
  const rentNetCost5 = rentNetCostAtYear(
    monthlyRent, rentInflation, downPayment, investmentReturn, ANALYSIS_YEARS
  );

  // --- Home value and equity at year 5 ---
  const homeValue5yr = homePrice * Math.pow(1 + appreciationRate, ANALYSIS_YEARS);
  const sellCosts5yr = homeValue5yr * sellFraction;
  const remainingBalance5yr = loanBalance(loanAmount, monthlyRate, totalLoanPayments, ANALYSIS_YEARS * 12);
  const equity5yr = homeValue5yr - sellCosts5yr - remainingBalance5yr;

  // --- Break-even year ---
  let breakevenYearStr = `> ${BREAKEVEN_MAX_YEARS} years`;
  for (let y = 1; y <= BREAKEVEN_MAX_YEARS; y++) {
    const bCost = buyNetCostAtYear(
      homePrice, downPayment, buyClosingCosts,
      monthlyPI, propertyTaxRate, insuranceAnnual, hoaMonthly,
      maintenanceRate, appreciationRate, sellFraction,
      monthlyRate, totalLoanPayments, loanAmount,
      y
    );
    const rCost = rentNetCostAtYear(
      monthlyRent, rentInflation, downPayment, investmentReturn, y
    );
    if (bCost <= rCost) {
      breakevenYearStr = `Year ${y}`;
      break;
    }
  }

  // --- Difference and summary ---
  const difference = buyNetCost5 - rentNetCost5;

  let winner: string;
  let margin: string;
  const absDiff = Math.abs(difference);
  const fmt = (n: number) =>
    "$" + Math.round(n).toLocaleString("en-US");

  if (Math.abs(difference) < 500) {
    winner = "Buying and renting are roughly equivalent";
    margin = "within $500";
  } else if (difference > 0) {
    winner = "Renting is cheaper";
    margin = `by ${fmt(absDiff)}`;
  } else {
    winner = "Buying is cheaper";
    margin = `by ${fmt(absDiff)}`;
  }

  const summary =
    `${winner} over 5 years ${margin}. ` +
    `Break-even: ${breakevenYearStr}. ` +
    `Monthly mortgage (P&I): ${fmt(monthlyPI)}. ` +
    `Home value at year 5: ${fmt(homeValue5yr)} | Equity (net of selling costs): ${fmt(equity5yr)}.`;

  return {
    buy_net_cost_5yr: Math.round(buyNetCost5),
    rent_net_cost_5yr: Math.round(rentNetCost5),
    difference_5yr: Math.round(difference),
    breakeven_year: breakevenYearStr,
    monthly_mortgage_payment: Math.round(monthlyPI),
    home_value_5yr: Math.round(homeValue5yr),
    equity_5yr: Math.round(equity5yr),
    summary
  };
}
