/**
 * Shared client-side math for the eight new English decision hubs.
 *
 * These are planning estimates, not statutory engines. Country-specific rates,
 * fees and thresholds stay editable in the UI so that a localized version can
 * replace them with an official data source without changing the experience.
 */

type Values = Record<string, any>;
type Case = { id?: string } | null | undefined;
type Row = {
  k: string;
  ref?: string;
  v: number;
  extra?: boolean;
  format?: 'ars' | 'plain' | 'unit';
  unit?: string;
  decimals?: number;
};
type Result = {
  total: string;
  sub: string;
  rows: Row[];
  chart: Array<{ label: string; value: number; tone?: string }>;
};

const n = (v: Values, key: string, fallback = 0): number => {
  const value = Number(v[key]);
  return Number.isFinite(value) ? value : fallback;
};

const positive = (v: Values, key: string, fallback = 0): number => Math.max(0, n(v, key, fallback));

const clamp = (value: number, low: number, high: number): number => Math.min(high, Math.max(low, value));

const usd = (value: number): string => {
  const rounded = Math.round(value);
  return (rounded < 0 ? '−$' : '$') + Math.abs(rounded).toLocaleString('en-US');
};

const USD = { format: 'unit' as const, unit: 'USD' };

function pmt(principal: number, annualRatePct: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / months;
  const factor = Math.pow(1 + r, months);
  return principal * r * factor / (factor - 1);
}

function monthsText(months: number): string {
  const whole = Math.max(0, Math.round(months));
  const years = Math.floor(whole / 12);
  const rest = whole % 12;
  if (years === 0) return `${rest} ${rest === 1 ? 'month' : 'months'}`;
  if (rest === 0) return `${years} ${years === 1 ? 'year' : 'years'}`;
  return `${years} yr ${rest} mo`;
}

function amortizedLoan(principal: number, annualRatePct: number, months: number, extra = 0) {
  const rate = Math.max(0, annualRatePct) / 100 / 12;
  const scheduled = pmt(principal, annualRatePct, months);
  const payment = scheduled + Math.max(0, extra);
  let balance = principal;
  let interest = 0;
  let count = 0;
  while (balance > 0.01 && count < 1_000) {
    count++;
    const charge = balance * rate;
    const principalPaid = Math.min(balance, Math.max(0, payment - charge));
    if (principalPaid <= 0) return { payment, months: 1_000, interest: 0, never: true, scheduled };
    interest += charge;
    balance -= principalPaid;
  }
  return { payment, months: count, interest, never: false, scheduled };
}

function result(total: number, sub: string, rows: Row[], chart: Result['chart']): Result {
  return { total: usd(total), sub, rows, chart };
}

/** Hub 1 — import purchase / landed cost. */
export function landedCost(v: Values, caso: Case): Result {
  const product = positive(v, 'product_value');
  const shipping = positive(v, 'shipping');
  const insurance = positive(v, 'insurance');
  const dutyRate = clamp(positive(v, 'duty_rate'), 0, 100);
  const vatRate = clamp(positive(v, 'vat_rate'), 0, 100);
  const fees = positive(v, 'fees');
  const quantity = Math.max(1, Math.round(positive(v, 'quantity', 1)));
  const sellingPrice = positive(v, 'selling_price');
  const marketplaceRate = clamp(positive(v, 'marketplace_rate'), 0, 100);
  const customsValue = product + shipping + insurance;
  const duty = customsValue * dutyRate / 100;
  const taxBase = customsValue + duty;
  const vat = taxBase * vatRate / 100;
  const total = customsValue + duty + vat + fees;
  const unit = total / quantity;
  const revenue = sellingPrice * quantity;
  const platformFee = revenue * marketplaceRate / 100;
  const profit = revenue - total - platformFee;
  const id = caso?.id || 'purchase';

  const rows: Row[] = [
    { k: 'Customs value (product + freight + insurance)', v: customsValue, ...USD },
    { k: 'Import duty', ref: `${dutyRate.toFixed(2)}% of customs value`, v: duty, ...USD },
    { k: 'Import VAT / GST', ref: `${vatRate.toFixed(2)}% after duty`, v: vat, ...USD },
    { k: 'Broker, carrier and processing fees', v: fees, ...USD },
    { k: 'Total landed cost', ref: `${quantity} unit${quantity === 1 ? '' : 's'}`, v: total, ...USD, extra: true },
    { k: 'Landed cost per unit', v: unit, ...USD, decimals: 2 },
  ];
  if (id === 'resale') {
    rows.push(
      { k: 'Sales revenue', v: revenue, ...USD },
      { k: 'Marketplace fees', ref: `${marketplaceRate.toFixed(2)}% of sales`, v: platformFee, ...USD },
      { k: 'Estimated gross profit', ref: 'Before income tax and fixed overhead', v: profit, ...USD, extra: true },
    );
  }
  return result(
    id === 'resale' ? profit : total,
    id === 'resale'
      ? `${usd(profit)} estimated gross profit after landed cost and marketplace fees.`
      : `${usd(total)} before any local sales tax, storage or resale costs.`,
    rows,
    [
      { label: 'Product + logistics', value: Math.round(customsValue), tone: 'main' },
      { label: 'Duty and VAT', value: Math.round(duty + vat), tone: 'warn' },
      { label: 'Fees', value: Math.round(fees), tone: 'prop' },
    ],
  );
}

/** Hub 2 — imported vehicle / nationalization. */
export function vehicleImport(v: Values, caso: Case): Result {
  const vehicle = positive(v, 'vehicle_price');
  const shipping = positive(v, 'vehicle_shipping');
  const insurance = positive(v, 'vehicle_insurance');
  const dutyRate = clamp(positive(v, 'vehicle_duty_rate'), 0, 200);
  const exciseRate = clamp(positive(v, 'vehicle_excise_rate'), 0, 200);
  const vatRate = clamp(positive(v, 'vehicle_vat_rate'), 0, 100);
  const port = positive(v, 'port_fees');
  const compliance = positive(v, 'compliance_cost');
  const registration = positive(v, 'registration_cost');
  const localPrice = positive(v, 'local_price');
  const customs = vehicle + shipping + insurance;
  const duty = customs * dutyRate / 100;
  const excise = (customs + duty) * exciseRate / 100;
  const vat = (customs + duty + excise) * vatRate / 100;
  const total = customs + duty + excise + vat + port + compliance + registration;
  const difference = localPrice - total;
  const id = caso?.id || 'import';
  const rows: Row[] = [
    { k: 'Vehicle + freight + insurance', v: customs, ...USD },
    { k: 'Import duty', ref: `${dutyRate.toFixed(2)}%`, v: duty, ...USD },
    { k: 'Excise / luxury / environmental tax', ref: `${exciseRate.toFixed(2)}% after duty`, v: excise, ...USD },
    { k: 'Import VAT / GST', ref: `${vatRate.toFixed(2)}% after duty and excise`, v: vat, ...USD },
    { k: 'Port and broker fees', v: port, ...USD },
    { k: 'Compliance and registration', v: compliance + registration, ...USD },
    { k: 'Total on-road imported cost', v: total, ...USD, extra: true },
  ];
  if (id === 'compare') rows.push({ k: difference >= 0 ? 'Saving versus buying locally' : 'Extra cost versus buying locally', v: Math.abs(difference), ...USD, extra: true });
  return result(
    id === 'compare' ? difference : total,
    id === 'compare'
      ? (difference >= 0 ? `${usd(difference)} below the local purchase price.` : `${usd(Math.abs(difference))} above the local purchase price.`)
      : `${usd(total)} estimated cost before financing, maintenance and insurance premiums.`,
    rows,
    [
      { label: 'Vehicle and logistics', value: Math.round(customs), tone: 'main' },
      { label: 'Taxes', value: Math.round(duty + excise + vat), tone: 'warn' },
      { label: 'Port, compliance and registration', value: Math.round(port + compliance + registration), tone: 'prop' },
    ],
  );
}

/** Hub 3 — international move affordability. */
export function moveAbroad(v: Values, caso: Case): Result {
  const annualGross = positive(v, 'annual_gross');
  const taxRate = clamp(positive(v, 'host_tax_rate'), 0, 100);
  const netMonthly = annualGross * (1 - taxRate / 100) / 12;
  const rent = positive(v, 'monthly_rent');
  const living = positive(v, 'monthly_living');
  const health = positive(v, 'monthly_health');
  const homeCosts = positive(v, 'home_country_costs');
  const relocation = positive(v, 'relocation_cost');
  const visa = positive(v, 'visa_cost');
  const gapMonths = positive(v, 'income_gap_months');
  const initial = relocation + visa + (netMonthly * gapMonths);
  const monthlySurplus = netMonthly - rent - living - health - homeCosts;
  const yearOne = monthlySurplus * 12 - initial;
  const fiveYear = monthlySurplus * 60 - initial;
  const id = caso?.id || 'job';
  const rows: Row[] = [
    { k: 'Estimated monthly take-home pay', ref: `${taxRate.toFixed(2)}% host-country tax assumption`, v: netMonthly, ...USD, decimals: 2 },
    { k: 'Monthly housing', v: rent, ...USD },
    { k: 'Monthly living costs', v: living, ...USD },
    { k: 'Health insurance and care', v: health, ...USD },
    { k: 'Home-country costs kept active', v: homeCosts, ...USD },
    { k: 'One-time move and visa costs', v: relocation + visa, ...USD },
    { k: 'Monthly surplus after recurring costs', v: monthlySurplus, ...USD, extra: true },
    { k: 'First-year net position', v: yearOne, ...USD, extra: true },
    { k: 'Five-year net position', ref: id === 'retire' ? 'Before investment returns and healthcare changes' : 'Before salary growth and investment returns', v: fiveYear, ...USD },
  ];
  return result(
    id === 'five-year' ? fiveYear : yearOne,
    monthlySurplus >= 0 ? `${usd(monthlySurplus)} left each month after the destination budget.` : `${usd(Math.abs(monthlySurplus))} short each month before the one-time move costs.`,
    rows,
    [
      { label: 'Take-home pay', value: Math.round(netMonthly), tone: 'main' },
      { label: 'Recurring costs', value: Math.round(Math.max(0, netMonthly - monthlySurplus)), tone: 'warn' },
      { label: 'Move and visa costs', value: Math.round(initial), tone: 'prop' },
    ],
  );
}

/** Hub 4 — tax residency and day-count planning. */
export function taxResidency(v: Values, caso: Case): Result {
  const currentDays = positive(v, 'current_days');
  const previousDays = positive(v, 'previous_days');
  const olderDays = positive(v, 'older_days');
  const currentMinimum = positive(v, 'current_minimum_days', 31);
  const weighted = currentDays + previousDays / 3 + olderDays / 6;
  const substantialPresence = currentDays >= currentMinimum && weighted >= positive(v, 'residency_threshold', 183);
  const foreignDays = positive(v, 'foreign_days');
  const physicalPresence = foreignDays >= positive(v, 'foreign_threshold', 330);
  const income = positive(v, 'foreign_income');
  const homeTax = clamp(positive(v, 'home_tax_rate'), 0, 100);
  const hostTax = clamp(positive(v, 'host_tax_rate'), 0, 100);
  const estimatedDifference = income * Math.abs(homeTax - hostTax) / 100;
  const id = caso?.id || 'us';
  const rows: Row[] = [
    { k: 'Current-year days', v: currentDays, format: 'unit', unit: 'days' },
    { k: 'Three-year weighted presence', ref: 'Current + 1/3 prior year + 1/6 older year', v: weighted, format: 'unit', unit: 'days', decimals: 1, extra: true },
    { k: 'Current-year minimum test', ref: `${currentMinimum} days`, v: currentDays >= currentMinimum ? 1 : 0, format: 'unit', unit: 'pass' },
    { k: 'Foreign physical-presence days', v: foreignDays, format: 'unit', unit: 'days' },
    { k: '330-day physical-presence test', ref: physicalPresence ? 'Threshold met' : 'Threshold not met', v: foreignDays, format: 'unit', unit: 'days' },
    { k: 'Estimated income-tax difference', ref: `${homeTax.toFixed(1)}% home vs ${hostTax.toFixed(1)}% host assumption`, v: estimatedDifference, ...USD, extra: true },
  ];
  const taxResult = id === 'feie' ? usd(estimatedDifference) : (substantialPresence ? 'Pass' : 'Review');
  return {
    total: taxResult,
    sub: id === 'feie'
      ? `${usd(estimatedDifference)} is the rough tax-rate gap on the income entered; treaty and source rules can change it.`
      : substantialPresence ? 'The entered days pass the weighted presence test.' : 'The entered days do not pass the weighted presence test.',
    rows,
    chart: [
      { label: 'Current-year days', value: Math.round(currentDays), tone: 'main' },
      { label: 'Weighted days', value: Math.round(weighted), tone: substantialPresence ? 'good' : 'warn' },
      { label: 'Foreign physical days', value: Math.round(foreignDays), tone: physicalPresence ? 'good' : 'prop' },
    ],
  };
}

/** Hub 5 — student-loan repayment scenarios. */
export function studentLoans(v: Values, caso: Case): Result {
  const balance = positive(v, 'loan_balance');
  const rate = clamp(positive(v, 'loan_rate'), 0, 60);
  const termMonths = Math.max(1, Math.round(positive(v, 'loan_term_years', 10) * 12));
  const extra = positive(v, 'extra_monthly');
  const income = positive(v, 'annual_income');
  const family = Math.max(1, Math.round(positive(v, 'family_size', 1)));
  const exemption = positive(v, 'income_exemption', 30_000);
  const incomePct = clamp(positive(v, 'income_payment_pct', 10), 0, 100);
  const standard = amortizedLoan(balance, rate, termMonths);
  const accelerated = amortizedLoan(balance, rate, termMonths, extra);
  const incomePayment = Math.max(0, (income - exemption * family) * incomePct / 100 / 12);
  const incomeRoute = incomePayment > 0 ? amortizedLoan(balance, rate, termMonths, Math.max(0, incomePayment - standard.scheduled)) : null;
  const id = caso?.id || 'standard';
  const rows: Row[] = [
    { k: 'Starting loan balance', v: balance, ...USD },
    { k: 'Scheduled monthly payment', ref: `${rate.toFixed(2)}% for ${termMonths / 12} years`, v: standard.payment, ...USD, decimals: 2 },
    { k: 'Scheduled total interest', v: standard.interest, ...USD, extra: true },
    { k: 'Payment under the entered income scenario', ref: `${incomePct.toFixed(1)}% above the entered exemption`, v: incomePayment, ...USD, decimals: 2 },
    { k: 'Extra monthly payment', v: extra, ...USD },
    { k: 'Interest saved by paying extra', ref: `${monthsText(Math.max(0, standard.months - accelerated.months))} faster`, v: Math.max(0, standard.interest - accelerated.interest), ...USD, extra: true },
  ];
  if (incomeRoute) rows.push({ k: 'Income-scenario payoff interest', v: incomeRoute.interest, ...USD });
  const main = id === 'extra' ? Math.max(0, standard.interest - accelerated.interest) : id === 'income' ? (incomeRoute?.interest || 0) : standard.interest;
  return result(
    main,
    id === 'extra'
      ? `${usd(Math.max(0, standard.interest - accelerated.interest))} interest avoided with the entered extra payment.`
      : id === 'income'
        ? `${usd(incomePayment)} estimated monthly income-based payment before plan-specific rules.`
        : `${usd(standard.payment)} per month and ${monthsText(standard.months)} to repay under the entered fixed schedule.`,
    rows,
    [
      { label: 'Principal', value: Math.round(balance), tone: 'main' },
      { label: 'Scheduled interest', value: Math.round(standard.interest), tone: 'warn' },
      { label: 'Interest avoided with extra', value: Math.round(Math.max(0, standard.interest - accelerated.interest)), tone: 'good' },
    ],
  );
}

/** Hub 6 — buy, finance or lease a car. */
export function autoDecision(v: Values, caso: Case): Result {
  const price = positive(v, 'car_price');
  const down = positive(v, 'down_payment');
  const trade = positive(v, 'trade_equity');
  const taxRate = clamp(positive(v, 'sales_tax_rate'), 0, 30);
  const fees = positive(v, 'dealer_fees');
  const rate = clamp(positive(v, 'auto_rate'), 0, 60);
  const loanMonths = Math.max(1, Math.round(positive(v, 'loan_term_years', 5) * 12));
  const leaseMonths = Math.max(1, Math.round(positive(v, 'lease_months', 36)));
  const leaseDue = positive(v, 'lease_due');
  const leasePayment = positive(v, 'lease_payment');
  const leaseBuyout = positive(v, 'lease_buyout');
  const residual = clamp(positive(v, 'resale_value_pct', 45), 0, 100);
  const maintenance = positive(v, 'annual_maintenance');
  const tax = price * taxRate / 100;
  const financedPrincipal = Math.max(0, price + tax + fees - down - trade);
  const loan = amortizedLoan(financedPrincipal, rate, loanMonths);
  const financeTotal = down + trade + loan.payment * loanMonths + maintenance * (loanMonths / 12);
  const leaseTotal = leaseDue + leasePayment * leaseMonths + leaseBuyout + maintenance * (leaseMonths / 12);
  const cashTotal = price + tax + fees + maintenance * (loanMonths / 12) - price * residual / 100;
  const id = caso?.id || 'finance';
  const rows: Row[] = [
    { k: 'Price plus tax and dealer fees', v: price + tax + fees, ...USD },
    { k: 'Amount financed', v: financedPrincipal, ...USD },
    { k: 'Finance payment', ref: `${rate.toFixed(2)}% for ${loanMonths} months`, v: loan.payment, ...USD, decimals: 2 },
    { k: 'Finance interest', v: loan.interest, ...USD },
    { k: 'Lease payments and due-at-signing', v: leaseDue + leasePayment * leaseMonths, ...USD },
    { k: 'Lease buyout at the end', v: leaseBuyout, ...USD },
    { k: 'Estimated ownership cost after resale', ref: `${residual.toFixed(1)}% resale assumption`, v: cashTotal, ...USD },
    { k: 'Estimated total cost for the finance route', v: financeTotal, ...USD, extra: true },
    { k: 'Estimated total cost for the lease route', v: leaseTotal, ...USD, extra: true },
  ];
  const chosen = id === 'lease' ? leaseTotal : id === 'cash' ? cashTotal : financeTotal;
  return result(
    chosen,
    id === 'lease' ? `${usd(leaseTotal)} over ${leaseMonths} months before excess-mileage and wear charges.` : id === 'cash' ? `${usd(cashTotal)} estimated net ownership cost after resale.` : `${usd(loan.payment)} per month and ${usd(financeTotal)} estimated ownership cost over the entered term.`,
    rows,
    [
      { label: 'Vehicle and taxes', value: Math.round(price + tax + fees), tone: 'main' },
      { label: 'Finance interest', value: Math.round(loan.interest), tone: 'warn' },
      { label: 'Lease route', value: Math.round(leaseTotal), tone: 'prop' },
    ],
  );
}

/** Hub 7 — coverage needs and deductible trade-offs. */
export function insuranceCoverage(v: Values, caso: Case): Result {
  const assets = positive(v, 'assets');
  const income = positive(v, 'annual_income');
  const dependents = Math.max(0, Math.round(positive(v, 'dependents')));
  const supportYears = Math.max(0, positive(v, 'support_years', 10));
  const debts = positive(v, 'debts');
  const education = positive(v, 'education_fund');
  const autoValue = positive(v, 'auto_value');
  const homeRebuild = positive(v, 'home_rebuild');
  const contents = positive(v, 'contents');
  const annualPremium = positive(v, 'annual_premium');
  const deductible = positive(v, 'deductible');
  const lifeNeed = Math.max(0, income * supportYears + debts + education - assets);
  const autoLiability = Math.max(0, assets + autoValue);
  const homeCoverage = homeRebuild + contents;
  const fiveYearPremium = annualPremium * 5;
  const id = caso?.id || 'life';
  const coverage = id === 'auto' ? autoLiability : id === 'home' ? homeCoverage : lifeNeed;
  const rows: Row[] = [
    { k: 'Recommended life coverage need', ref: 'Income replacement + debts + education − assets', v: lifeNeed, ...USD },
    { k: 'Suggested auto liability starting point', ref: 'Assets plus vehicle value; local law may set a different minimum', v: autoLiability, ...USD },
    { k: 'Home property coverage base', ref: 'Rebuild cost plus contents', v: homeCoverage, ...USD },
    { k: 'Annual premium entered', v: annualPremium, ...USD },
    { k: 'Five-year premiums', v: fiveYearPremium, ...USD, extra: true },
    { k: 'Cash paid before a covered claim', ref: 'Deductible', v: deductible, ...USD },
    { k: 'Selected coverage estimate', v: coverage, ...USD, extra: true },
  ];
  return result(
    coverage,
    id === 'auto' ? `${usd(coverage)} is a planning starting point for liability, not a legal minimum.` : id === 'home' ? `${usd(coverage)} is the replacement-cost starting point before endorsements and local limits.` : `${usd(coverage)} is the estimated income-replacement gap for the household.`,
    rows,
    [
      { label: 'Coverage need', value: Math.round(coverage), tone: 'main' },
      { label: 'Five-year premiums', value: Math.round(fiveYearPremium), tone: 'prop' },
      { label: 'Deductible', value: Math.round(deductible), tone: 'warn' },
    ],
  );
}

/** Hub 8 — health-plan premium and out-of-pocket scenarios. */
export function medicalOutOfPocket(v: Values, caso: Case): Result {
  const annualPremium = positive(v, 'annual_premium');
  const deductible = positive(v, 'deductible');
  const coinsurance = clamp(positive(v, 'coinsurance'), 0, 100) / 100;
  const copays = positive(v, 'copays');
  const oopMax = positive(v, 'oop_max');
  const coveredSpend = positive(v, 'covered_spend');
  const secondPremium = positive(v, 'second_premium');
  const secondDeductible = positive(v, 'second_deductible');
  const secondCoinsurance = clamp(positive(v, 'second_coinsurance'), 0, 100) / 100;
  const secondOopMax = positive(v, 'second_oop_max');
  const costForPlan = (premium: number, ded: number, share: number, max: number) => premium * 12 + Math.min(max || Number.MAX_SAFE_INTEGER, ded + Math.max(0, coveredSpend - ded) * share + copays);
  const planA = costForPlan(annualPremium, deductible, coinsurance, oopMax);
  const planB = costForPlan(secondPremium, secondDeductible, secondCoinsurance, secondOopMax);
  const id = caso?.id || 'annual';
  const rows: Row[] = [
    { k: 'Annual premiums', v: annualPremium * 12, ...USD },
    { k: 'Estimated covered-care cost sharing', ref: 'Deductible + coinsurance + copays, capped at the entered maximum', v: Math.max(0, planA - annualPremium * 12), ...USD },
    { k: 'Estimated annual total — Plan A', v: planA, ...USD, extra: true },
    { k: 'Estimated annual total — Plan B', v: planB, ...USD },
    { k: id === 'compare' ? (planA <= planB ? 'Plan A estimated saving' : 'Plan B estimated saving') : 'Entered out-of-pocket maximum', v: id === 'compare' ? Math.abs(planA - planB) : oopMax, ...USD, extra: true },
  ];
  const total = id === 'compare' ? Math.min(planA, planB) : planA;
  return result(
    total,
    id === 'compare' ? `${planA <= planB ? 'Plan A' : 'Plan B'} is lower by ${usd(Math.abs(planA - planB))} under these usage assumptions.` : `${usd(total)} estimated annual cost including premiums and covered in-network care.`,
    rows,
    [
      { label: 'Premiums', value: Math.round(annualPremium * 12), tone: 'main' },
      { label: 'Plan A cost sharing', value: Math.round(Math.max(0, planA - annualPremium * 12)), tone: 'warn' },
      { label: 'Plan B total', value: Math.round(planB), tone: 'prop' },
    ],
  );
}
