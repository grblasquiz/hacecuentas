export interface Inputs {
  gross_annual_income: number;
  monthly_debts: number;
  down_payment: number;
  mortgage_rate: number;
  loan_term: string;
  property_tax_rate: number;
  annual_insurance: number;
  front_end_dti: number;
  back_end_dti: number;
}

export interface Outputs {
  max_home_price: number;
  max_loan_amount: number;
  monthly_pi: number;
  monthly_tax: number;
  monthly_insurance: number;
  total_monthly_housing: number;
  front_end_ratio_used: number;
  back_end_ratio_used: number;
  limiting_factor: string;
}

// Default mortgage rate source: Freddie Mac PMMS, 30-yr fixed, early 2026
const DEFAULT_RATE_2026 = 6.8;

export function compute(i: Inputs): Outputs {
  const zero: Outputs = {
    max_home_price: 0,
    max_loan_amount: 0,
    monthly_pi: 0,
    monthly_tax: 0,
    monthly_insurance: 0,
    total_monthly_housing: 0,
    front_end_ratio_used: 0,
    back_end_ratio_used: 0,
    limiting_factor: "Enter valid inputs",
  };

  const grossAnnualIncome = Number(i.gross_annual_income) || 0;
  const monthlyDebts = Math.max(Number(i.monthly_debts) || 0, 0);
  const downPayment = Math.max(Number(i.down_payment) || 0, 0);
  const annualRate = Number(i.mortgage_rate) > 0 ? Number(i.mortgage_rate) : DEFAULT_RATE_2026;
  const termYears = parseInt(i.loan_term || "30", 10) || 30;
  const propTaxRate = Number(i.property_tax_rate) > 0 ? Number(i.property_tax_rate) : 0;
  const annualInsurance = Math.max(Number(i.annual_insurance) || 0, 0);
  const frontEndDTI = Number(i.front_end_dti) > 0 ? Number(i.front_end_dti) : 28;
  const backEndDTI = Number(i.back_end_dti) > 0 ? Number(i.back_end_dti) : 36;

  if (grossAnnualIncome <= 0) {
    return { ...zero, limiting_factor: "Enter a valid gross annual income" };
  }

  const grossMonthlyIncome = grossAnnualIncome / 12;
  const monthlyInsurance = annualInsurance / 12;
  const n = termYears * 12; // number of payments
  const r = annualRate / 100 / 12; // monthly interest rate

  // Amortization factor: payment per $1 of loan
  // P&I = Loan * r / (1 - (1+r)^-n)
  // Rearranged: Loan = P&I * (1 - (1+r)^-n) / r
  let amortFactor: number;
  if (r === 0) {
    // 0% interest edge case
    amortFactor = n > 0 ? 1 / n : 0;
  } else {
    amortFactor = r / (1 - Math.pow(1 + r, -n));
  }

  // We need to solve for max home price.
  // Monthly tax depends on home price, so we iterate once:
  // First pass: estimate tax/insurance on a rough home price,
  // then solve for loan, then compute final home price and recalculate.
  // One iteration is sufficient for practical accuracy.

  // --- Pass 1: estimate with down payment as rough anchor ---
  // Rough home estimate = down payment * 10 as seed, or just use 0 for tax first pass
  const solve = (homePrice: number): {
    loanAmount: number;
    pi: number;
    monthlyTax: number;
    monthlyIns: number;
    maxPIFront: number;
    maxPIBack: number;
    bindingPI: number;
    newHomePrice: number;
  } => {
    const mTax = (homePrice * (propTaxRate / 100)) / 12;
    const mIns = monthlyInsurance;

    // Front-end: PITI <= GMI * frontEndDTI%
    const maxPITI_front = grossMonthlyIncome * (frontEndDTI / 100);
    const maxPI_front = maxPITI_front - mTax - mIns;

    // Back-end: PITI + other debts <= GMI * backEndDTI%
    const maxTotalDebt_back = grossMonthlyIncome * (backEndDTI / 100);
    const maxPI_back = maxTotalDebt_back - monthlyDebts - mTax - mIns;

    const bindingPI = Math.min(maxPI_front, maxPI_back);

    if (bindingPI <= 0) {
      return { loanAmount: 0, pi: 0, monthlyTax: mTax, monthlyIns: mIns, maxPIFront: maxPI_front, maxPIBack: maxPI_back, bindingPI: 0, newHomePrice: downPayment };
    }

    // Max loan from binding P&I
    let maxLoan: number;
    if (amortFactor === 0) {
      maxLoan = 0;
    } else {
      maxLoan = bindingPI / amortFactor;
    }

    const newHomePrice = maxLoan + downPayment;
    return { loanAmount: maxLoan, pi: bindingPI, monthlyTax: mTax, monthlyIns: mIns, maxPIFront: maxPI_front, maxPIBack: maxPI_back, bindingPI, newHomePrice };
  };

  // Pass 1: seed with a rough estimate
  const seedPrice = downPayment > 0 ? downPayment * 8 : grossAnnualIncome * 3;
  const pass1 = solve(seedPrice);

  // Pass 2: refine using the home price from pass 1
  const pass2 = solve(pass1.newHomePrice);

  // Pass 3: one more refinement for accuracy
  const pass3 = solve(pass2.newHomePrice);

  if (pass3.bindingPI <= 0 || pass3.loanAmount <= 0) {
    return {
      ...zero,
      limiting_factor: "Income and debts do not support a mortgage at these parameters",
    };
  }

  const finalHomePrice = pass3.newHomePrice;
  const finalLoanAmount = pass3.loanAmount;
  const finalMonthlyPI = pass3.pi;
  const finalMonthlyTax = (finalHomePrice * (propTaxRate / 100)) / 12;
  const finalMonthlyIns = monthlyInsurance;
  const totalMonthlyHousing = finalMonthlyPI + finalMonthlyTax + finalMonthlyIns;

  // Actual DTI ratios at final home price
  const frontEndRatioUsed = grossMonthlyIncome > 0 ? (totalMonthlyHousing / grossMonthlyIncome) * 100 : 0;
  const backEndRatioUsed = grossMonthlyIncome > 0 ? ((totalMonthlyHousing + monthlyDebts) / grossMonthlyIncome) * 100 : 0;

  // Determine which constraint was binding
  let limitingFactor: string;
  const diff = pass3.maxPIFront - pass3.maxPIBack;
  if (Math.abs(diff) < 1) {
    limitingFactor = "Front-end and back-end limits are equal";
  } else if (diff < 0) {
    // front-end is smaller => front binds
    limitingFactor = `Front-end DTI (${frontEndDTI}% housing limit)`;
  } else {
    // back-end is smaller => back binds
    limitingFactor = `Back-end DTI (${backEndDTI}% total debt limit)`;
  }

  return {
    max_home_price: Math.round(finalHomePrice),
    max_loan_amount: Math.round(finalLoanAmount),
    monthly_pi: Math.round(finalMonthlyPI * 100) / 100,
    monthly_tax: Math.round(finalMonthlyTax * 100) / 100,
    monthly_insurance: Math.round(finalMonthlyIns * 100) / 100,
    total_monthly_housing: Math.round(totalMonthlyHousing * 100) / 100,
    front_end_ratio_used: Math.round(frontEndRatioUsed * 10) / 10,
    back_end_ratio_used: Math.round(backEndRatioUsed * 10) / 10,
    limiting_factor: limitingFactor,
  };
}
