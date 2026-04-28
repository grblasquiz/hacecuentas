export interface Inputs {
  home_price: number;
  down_payment_pct: number;
  annual_rate: number;
  term_years: string;
  monthly_insurance: number;
  start_date: string;
}

export interface Outputs {
  monthly_payment: number;
  monthly_total: number;
  total_paid: number;
  total_interest: number;
  principal: number;
  capital_year1: number;
  capital_year5: number;
  payoff_date: string;
}

// Tasa anual de referencia LATAM 2026 (Banxico, CMF, Superfinanciera)
const DEFAULT_ANNUAL_RATE_2026 = 7.0;

function addMonths(date: Date, months: number): Date {
  const d = new Date(date.getTime());
  d.setMonth(d.getMonth() + months);
  return d;
}

function formatDate(date: Date): string {
  const months = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];
  return months[date.getMonth()] + " " + date.getFullYear();
}

export function compute(i: Inputs): Outputs {
  const homePrice = Number(i.home_price) || 0;
  const downPct = Number(i.down_payment_pct) || 0;
  const annualRate = Number(i.annual_rate) > 0 ? Number(i.annual_rate) : DEFAULT_ANNUAL_RATE_2026;
  const termYears = parseInt(i.term_years || "30", 10) || 30;
  const monthlyInsurance = Number(i.monthly_insurance) || 0;

  // Validaciones defensivas
  if (homePrice <= 0) {
    return {
      monthly_payment: 0,
      monthly_total: 0,
      total_paid: 0,
      total_interest: 0,
      principal: 0,
      capital_year1: 0,
      capital_year5: 0,
      payoff_date: "Ingresa un precio de vivienda válido"
    };
  }

  const clampedDownPct = Math.min(Math.max(downPct, 0), 99);
  const downPayment = homePrice * (clampedDownPct / 100);
  const principal = homePrice - downPayment;

  if (principal <= 0) {
    return {
      monthly_payment: 0,
      monthly_total: monthlyInsurance,
      total_paid: 0,
      total_interest: 0,
      principal: 0,
      capital_year1: 0,
      capital_year5: 0,
      payoff_date: "Sin préstamo requerido con esa entrada"
    };
  }

  // Fórmula francesa: M = P · i · (1+i)^n / ((1+i)^n - 1)
  const monthlyRate = annualRate / 100 / 12;
  const n = termYears * 12;

  let monthlyPayment: number;

  if (monthlyRate === 0) {
    // Caso borde: tasa 0%
    monthlyPayment = principal / n;
  } else {
    const factor = Math.pow(1 + monthlyRate, n);
    monthlyPayment = (principal * monthlyRate * factor) / (factor - 1);
  }

  const totalPaid = monthlyPayment * n;
  const totalInterest = totalPaid - principal;
  const monthlyTotal = monthlyPayment + monthlyInsurance;

  // Amortización acumulada año 1 (cuotas 1-12)
  let balance = principal;
  let capitalYear1 = 0;
  for (let month = 1; month <= Math.min(12, n); month++) {
    const interestPart = balance * monthlyRate;
    const capitalPart = monthlyPayment - interestPart;
    capitalYear1 += capitalPart;
    balance -= capitalPart;
  }

  // Continuamos hasta el mes 60 para año 5
  let capitalYear5 = capitalYear1;
  for (let month = 13; month <= Math.min(60, n); month++) {
    const interestPart = balance * monthlyRate;
    const capitalPart = monthlyPayment - interestPart;
    capitalYear5 += capitalPart;
    balance -= capitalPart;
  }

  // Fecha de pago final
  let payoffDate = "No disponible";
  let startDateObj: Date;
  if (i.start_date && i.start_date.length >= 7) {
    const parsed = new Date(i.start_date + (i.start_date.length === 7 ? "-01" : ""));
    startDateObj = isNaN(parsed.getTime()) ? new Date() : parsed;
  } else {
    startDateObj = new Date();
    startDateObj.setDate(1);
    startDateObj.setMonth(startDateObj.getMonth() + 1);
  }
  const payoffDateObj = addMonths(startDateObj, n);
  payoffDate = formatDate(payoffDateObj);

  return {
    monthly_payment: Math.round(monthlyPayment * 100) / 100,
    monthly_total: Math.round(monthlyTotal * 100) / 100,
    total_paid: Math.round(totalPaid * 100) / 100,
    total_interest: Math.round(totalInterest * 100) / 100,
    principal: Math.round(principal * 100) / 100,
    capital_year1: Math.round(capitalYear1 * 100) / 100,
    capital_year5: Math.round(capitalYear5 * 100) / 100,
    payoff_date: payoffDate
  };
}
