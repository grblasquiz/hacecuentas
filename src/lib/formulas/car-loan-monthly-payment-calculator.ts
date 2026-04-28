export interface Inputs {
  vehicle_price: number;
  trade_in_value: number;
  down_payment: number;
  sales_tax_rate: number;
  loan_term_months: string;
  apr: number;
}

export interface Outputs {
  monthly_payment: number;
  total_paid: number;
  total_interest: number;
  financed_amount: number;
  amortization_table: string;
}

// Average APRs — Experian Q1 2026
// New vehicle avg: 7.5%, Used vehicle avg: 11.5%

function roundCents(value: number): number {
  return Math.round(value * 100) / 100;
}

export function compute(i: Inputs): Outputs {
  const vehiclePrice = Number(i.vehicle_price) || 0;
  const tradeIn = Math.max(Number(i.trade_in_value) || 0, 0);
  const downPayment = Math.max(Number(i.down_payment) || 0, 0);
  const salesTaxRate = Math.max(Number(i.sales_tax_rate) || 0, 0);
  const n = parseInt(i.loan_term_months, 10) || 60;
  const aprRaw = Math.max(Number(i.apr) || 0, 0);

  if (vehiclePrice <= 0) {
    return {
      monthly_payment: 0,
      total_paid: 0,
      total_interest: 0,
      financed_amount: 0,
      amortization_table: "Enter a valid vehicle price.",
    };
  }

  // Step 1: Calculate financed amount
  // Sales tax is applied to price after trade-in (most US states method)
  const taxablePrice = Math.max(vehiclePrice - tradeIn, 0);
  const taxAmount = taxablePrice * (salesTaxRate / 100);
  const adjustedPrice = vehiclePrice + taxAmount;
  const financedRaw = adjustedPrice - tradeIn - downPayment;
  const financedAmount = Math.max(roundCents(financedRaw), 0);

  if (financedAmount <= 0) {
    return {
      monthly_payment: 0,
      total_paid: 0,
      total_interest: 0,
      financed_amount: 0,
      amortization_table: "No financing needed — down payment and trade-in cover the full cost.",
    };
  }

  // Step 2: Monthly payment using standard PMT formula
  const r = aprRaw / 100 / 12; // monthly interest rate

  let monthlyPayment: number;
  if (r === 0) {
    // 0% APR special case
    monthlyPayment = financedAmount / n;
  } else {
    const factor = Math.pow(1 + r, n);
    monthlyPayment = financedAmount * (r * factor) / (factor - 1);
  }
  monthlyPayment = roundCents(monthlyPayment);

  // Step 3: Totals
  const totalPaid = roundCents(monthlyPayment * n);
  const totalInterest = roundCents(totalPaid - financedAmount);

  // Step 4: Amortization for first 12 months (or full term if shorter)
  const amortMonths = Math.min(12, n);
  let balance = financedAmount;
  const rows: string[] = [];
  rows.push("Month | Payment | Principal | Interest | Balance");
  rows.push("------|---------|-----------|----------|--------");

  for (let m = 1; m <= amortMonths; m++) {
    const interestPortion = roundCents(balance * r);
    let principalPortion = roundCents(monthlyPayment - interestPortion);
    // Last month: adjust for rounding
    if (m === n) {
      principalPortion = balance;
    }
    balance = roundCents(Math.max(balance - principalPortion, 0));

    const fmt = (v: number) =>
      "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    rows.push(
      `${m} | ${fmt(monthlyPayment)} | ${fmt(principalPortion)} | ${fmt(interestPortion)} | ${fmt(balance)}`
    );
  }

  if (n > 12) {
    rows.push(`... (showing months 1–12 of ${n} total)`);
  }

  const amortizationTable = rows.join("\n");

  return {
    monthly_payment: monthlyPayment,
    total_paid: totalPaid,
    total_interest: totalInterest,
    financed_amount: financedAmount,
    amortization_table: amortizationTable,
  };
}
