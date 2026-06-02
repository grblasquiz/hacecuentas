export interface Inputs {
  home_price: number;
  down_payment_pct: number;
  loan_term: string;
  interest_rate: number;
  property_tax_pct: number;
  home_insurance_yr: number;
  pmi_rate: number;
  start_month: string;
  start_year: number;
}

export interface Outputs {
  total_monthly: number;
  pi_payment: number;
  monthly_tax: number;
  monthly_insurance: number;
  monthly_pmi: number;
  loan_amount: number;
  down_payment_amount: number;
  total_interest: number;
  total_cost: number;
  payoff_date: string;
  pmi_note: string;
  _insight?: any;
  _chart?: any;
}

// Default 30-yr fixed rate per Freddie Mac PMMS, 2026
const DEFAULT_RATE_2026 = 6.8;

function getMonthName(month: number): string {
  const months = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
  ];
  return months[month - 1] || "";
}

export function compute(i: Inputs): Outputs {
  const homePrice = Number(i.home_price) || 0;
  const downPct = Number(i.down_payment_pct) || 0;
  const loanTermYears = parseInt(i.loan_term || "30", 10) || 30;
  const annualRate = Number(i.interest_rate) > 0 ? Number(i.interest_rate) : DEFAULT_RATE_2026;
  const propertyTaxPct = Number(i.property_tax_pct) || 0;
  const homeInsuranceYr = Number(i.home_insurance_yr) || 0;
  const pmiRate = Number(i.pmi_rate) || 0;
  const startMonth = parseInt(i.start_month || "1", 10) || 1;
  const startYear = Number(i.start_year) || 2026;

  // Guard: home price must be positive
  if (homePrice <= 0) {
    return {
      total_monthly: 0,
      pi_payment: 0,
      monthly_tax: 0,
      monthly_insurance: 0,
      monthly_pmi: 0,
      loan_amount: 0,
      down_payment_amount: 0,
      total_interest: 0,
      total_cost: 0,
      payoff_date: "—",
      pmi_note: "Enter a valid home price to calculate."
    };
  }

  // Core calculations
  const downPaymentAmount = homePrice * (downPct / 100);
  const loanAmount = homePrice - downPaymentAmount;

  // Guard: loan amount must be positive
  if (loanAmount <= 0) {
    return {
      total_monthly: 0,
      pi_payment: 0,
      monthly_tax: 0,
      monthly_insurance: homeInsuranceYr / 12,
      monthly_pmi: 0,
      loan_amount: 0,
      down_payment_amount: downPaymentAmount,
      total_interest: 0,
      total_cost: 0,
      payoff_date: "—",
      pmi_note: "Down payment covers full home price — no loan needed."
    };
  }

  const n = loanTermYears * 12; // total number of payments
  const r = annualRate / 100 / 12; // monthly interest rate

  // P&I using standard amortization formula: M = P * r(1+r)^n / ((1+r)^n - 1)
  let piPayment: number;
  if (r === 0) {
    // Edge case: 0% interest rate
    piPayment = loanAmount / n;
  } else {
    const compoundFactor = Math.pow(1 + r, n);
    piPayment = loanAmount * (r * compoundFactor) / (compoundFactor - 1);
  }

  // Monthly escrow items
  const monthlyTax = (homePrice * (propertyTaxPct / 100)) / 12;
  const monthlyInsurance = homeInsuranceYr / 12;

  // PMI: only if down payment < 20%
  const requiresPMI = downPct < 20;
  const monthlyPMI = requiresPMI ? (loanAmount * (pmiRate / 100)) / 12 : 0;

  const totalMonthly = piPayment + monthlyTax + monthlyInsurance + monthlyPMI;

  // Total interest over life of loan (P&I only)
  const totalPaid = piPayment * n;
  const totalInterest = totalPaid - loanAmount;

  // Payoff date calculation
  // Add n months to the start date
  let payoffMonth = startMonth + n;
  let payoffYear = startYear;
  payoffYear += Math.floor((payoffMonth - 1) / 12);
  payoffMonth = ((payoffMonth - 1) % 12) + 1;
  const payoffDate = `${getMonthName(payoffMonth)} ${payoffYear}`;

  // PMI note
  let pmiNote: string;
  if (!requiresPMI) {
    pmiNote = "No PMI required — down payment is 20% or more.";
  } else {
    pmiNote = `PMI applies (~$${monthlyPMI.toFixed(0)}/mo). Can be removed once loan balance reaches 80% of home value.`;
  }

  const fmtUsd = (n: number) => '$' + new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(n));
  const interestPctOfLoan = Math.round((totalInterest / loanAmount) * 100);

  let insightTone: 'good' | 'warn' | 'neutral';
  let insightTitle: string;
  let insightText: string;
  if (requiresPMI) {
    insightTone = 'warn';
    insightTitle = 'PMI is adding to your payment';
    insightText = `Your ${downPct}% down payment is below 20%, so PMI of about **${fmtUsd(monthlyPMI)}/mo** is baked into your **${fmtUsd(totalMonthly)}** payment. Over the loan you pay **${fmtUsd(totalInterest)}** in interest (${interestPctOfLoan}% of the ${fmtUsd(loanAmount)} borrowed); PMI drops off once you reach 20% equity.`;
  } else if (interestPctOfLoan >= 80) {
    insightTone = 'warn';
    insightTitle = 'Interest nearly doubles the loan';
    insightText = `Your payment is **${fmtUsd(totalMonthly)}/mo**, but over ${loanTermYears} years you pay **${fmtUsd(totalInterest)}** in interest — about ${interestPctOfLoan}% of the ${fmtUsd(loanAmount)} borrowed. A shorter term or extra principal payments would cut that sharply.`;
  } else {
    insightTone = 'neutral';
    insightTitle = 'Your monthly breakdown';
    insightText = `Your all-in payment is **${fmtUsd(totalMonthly)}/mo**, of which **${fmtUsd(piPayment)}** is principal & interest. Over ${loanTermYears} years you pay **${fmtUsd(totalInterest)}** in interest on the ${fmtUsd(loanAmount)} loan, paid off by ${payoffDate}.`;
  }

  const slices = [
    { label: 'Principal & interest', value: Math.round(piPayment * 100) / 100 },
  ];
  if (monthlyTax > 0) slices.push({ label: 'Property tax', value: Math.round(monthlyTax * 100) / 100 });
  if (monthlyInsurance > 0) slices.push({ label: 'Home insurance', value: Math.round(monthlyInsurance * 100) / 100 });
  if (monthlyPMI > 0) slices.push({ label: 'PMI', value: Math.round(monthlyPMI * 100) / 100 });

  return {
    total_monthly: totalMonthly,
    pi_payment: piPayment,
    monthly_tax: monthlyTax,
    monthly_insurance: monthlyInsurance,
    monthly_pmi: monthlyPMI,
    loan_amount: loanAmount,
    down_payment_amount: downPaymentAmount,
    total_interest: totalInterest,
    total_cost: totalPaid,
    payoff_date: payoffDate,
    pmi_note: pmiNote,
    _insight: {
      title: insightTitle,
      text: insightText,
      tone: insightTone,
      icon: '🏠',
    },
    _chart: {
      type: 'doughnut',
      slices,
      prefix: '$',
      centerValue: fmtUsd(totalMonthly),
      centerLabel: 'Monthly payment',
      ariaLabel: `Monthly payment breakdown totaling ${fmtUsd(totalMonthly)}`,
    },
  };
}
