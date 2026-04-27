export interface Inputs {
  schoolTier: string;
  tuitionOverride: number;
  currentSalary: number;
  postMbaSalary: number;
  programDuration: string;
  livingCostPerYear: number;
  savingsUsed: number;
  loanAmount: number;
  loanInterestRate: number;
  loanTermYears: number;
  discountRate: number;
}

export interface Outputs {
  totalInvestment: number;
  annualSalaryGain: number;
  simplePaybackYears: number;
  npvAt10Years: number;
  irrPercent: number;
  loanMonthlyPayment: number;
  breakEvenYear: number;
  summaryText: string;
}

// Tuition de referencia por tier (USD, 2025-2026)
// Fuente: Financial Times MBA Ranking 2025, sitios oficiales de escuelas
const TUITION_BY_TIER: Record<string, number> = {
  m7: 200000,      // promedio Harvard/Wharton/Stanford/INSEAD total program
  top25: 120000,   // promedio Darden/Ross/Fuqua/IE/IESE
  top50: 65000,    // promedio escuelas regionales reconocidas
  custom: 0,       // se usa tuitionOverride
};

function calcLoanMonthlyPayment(
  principal: number,
  annualRate: number,
  termYears: number
): number {
  if (principal <= 0) return 0;
  if (annualRate <= 0) return principal / (termYears * 12);
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function calcTotalLoanInterest(
  principal: number,
  annualRate: number,
  termYears: number
): number {
  if (principal <= 0) return 0;
  const monthly = calcLoanMonthlyPayment(principal, annualRate, termYears);
  return monthly * termYears * 12 - principal;
}

// Estima TIR numéricamente con bisección sobre horizonte de carrera de 30 años
function estimateIRR(
  totalCost: number,
  annualGain: number,
  programYears: number,
  careerHorizonYears: number = 30
): number {
  if (annualGain <= 0 || totalCost <= 0) return 0;

  const npvAtRate = (rate: number): number => {
    let npv = -totalCost;
    for (let t = 1; t <= careerHorizonYears; t++) {
      npv += annualGain / Math.pow(1 + rate, t + programYears);
    }
    return npv;
  };

  // Bisección entre 0% y 200%
  let lo = 0;
  let hi = 2.0;
  if (npvAtRate(lo) < 0) return 0; // no hay IRR positiva
  for (let iter = 0; iter < 100; iter++) {
    const mid = (lo + hi) / 2;
    if (npvAtRate(mid) > 0) {
      lo = mid;
    } else {
      hi = mid;
    }
    if (hi - lo < 0.0001) break;
  }
  return (lo + hi) / 2;
}

export function compute(i: Inputs): Outputs {
  // --- Parseo y validación de inputs ---
  const schoolTier = i.schoolTier || "m7";
  const tuitionOverride = Math.max(0, Number(i.tuitionOverride) || 0);
  const currentSalary = Math.max(0, Number(i.currentSalary) || 0);
  const postMbaSalary = Math.max(0, Number(i.postMbaSalary) || 0);
  const programYears = Math.max(1, parseFloat(i.programDuration) || 2);
  const livingCostPerYear = Math.max(0, Number(i.livingCostPerYear) || 0);
  const savingsUsed = Math.max(0, Number(i.savingsUsed) || 0);
  const loanAmount = Math.max(0, Number(i.loanAmount) || 0);
  const loanInterestRate = Math.max(0, Number(i.loanInterestRate) || 0);
  const loanTermYears = Math.max(1, Number(i.loanTermYears) || 10);
  const discountRatePct = Math.max(0, Number(i.discountRate) || 7);
  const discountRate = discountRatePct / 100;

  if (currentSalary <= 0 || postMbaSalary <= 0) {
    return {
      totalInvestment: 0,
      annualSalaryGain: 0,
      simplePaybackYears: 0,
      npvAt10Years: 0,
      irrPercent: 0,
      loanMonthlyPayment: 0,
      breakEvenYear: 0,
      summaryText: "Ingresá salarios válidos para calcular el ROI.",
    };
  }

  // --- Tuition ---
  const tuition =
    schoolTier === "custom"
      ? tuitionOverride
      : TUITION_BY_TIER[schoolTier] ?? TUITION_BY_TIER["m7"];

  // --- Costo de oportunidad (salario resignado durante el programa) ---
  const opportunityCost = currentSalary * programYears;

  // --- Costo de vida durante el programa ---
  const livingTotal = livingCostPerYear * programYears;

  // --- Intereses totales del préstamo ---
  const loanInterestTotal = calcTotalLoanInterest(
    loanAmount,
    loanInterestRate,
    loanTermYears
  );

  // --- Inversión total ---
  // Costo Total = Tuition + Costo de Oportunidad + Costo de Vida + Intereses del Préstamo
  const totalInvestment =
    tuition + opportunityCost + livingTotal + loanInterestTotal;

  // --- Aumento salarial anual ---
  const annualSalaryGain = postMbaSalary - currentSalary;

  if (annualSalaryGain <= 0) {
    return {
      totalInvestment,
      annualSalaryGain,
      simplePaybackYears: 0,
      npvAt10Years: -totalInvestment,
      irrPercent: 0,
      loanMonthlyPayment: calcLoanMonthlyPayment(
        loanAmount,
        loanInterestRate,
        loanTermYears
      ),
      breakEvenYear: 0,
      summaryText:
        "El salario post-MBA no supera el salario actual: el ROI es negativo. Revisá las cifras ingresadas.",
    };
  }

  // --- Payback simple ---
  const simplePaybackYears = totalInvestment / annualSalaryGain;

  // --- VAN a 10 años post-MBA ---
  // Los flujos positivos comienzan luego del programa (t = programYears + 1, ..., programYears + 10)
  let npvAt10Years = -totalInvestment;
  for (let t = 1; t <= 10; t++) {
    npvAt10Years += annualSalaryGain / Math.pow(1 + discountRate, t + programYears);
  }

  // --- TIR estimada ---
  const irrDecimal = estimateIRR(totalInvestment, annualSalaryGain, programYears);
  const irrPercent = irrDecimal * 100;

  // --- Cuota mensual del préstamo ---
  const loanMonthlyPayment = calcLoanMonthlyPayment(
    loanAmount,
    loanInterestRate,
    loanTermYears
  );

  // --- Año de breakeven (desde inicio del programa) ---
  // Incluye los años del programa + años para recuperar post-MBA
  const breakEvenYear = Math.ceil(programYears + simplePaybackYears);

  // --- Texto de resumen ---
  const tierLabels: Record<string, string> = {
    m7: "M7 / Top 10 global",
    top25: "Top 11-25",
    top50: "Top 26-50",
    custom: "personalizado",
  };
  const tierLabel = tierLabels[schoolTier] || schoolTier;
  const vanSign = npvAt10Years >= 0 ? "positivo" : "negativo";
  const irrVerdict =
    irrPercent >= 15
      ? "excelente retorno"
      : irrPercent >= 8
      ? "retorno razonable"
      : "retorno por debajo del costo de oportunidad del capital";

  const summaryText =
    `Programa ${tierLabel} (${programYears} año${programYears > 1 ? "s" : ""}). ` +
    `Inversión total (incluyendo costo de oportunidad): USD ${Math.round(totalInvestment).toLocaleString("es")}. ` +
    `Aumento salarial: USD ${Math.round(annualSalaryGain).toLocaleString("es")}/año. ` +
    `Recupero simple en ${simplePaybackYears.toFixed(1)} años post-MBA (año ${breakEvenYear} desde el inicio). ` +
    `VAN a 10 años ${vanSign} (USD ${Math.round(npvAt10Years).toLocaleString("es")}). ` +
    `TIR estimada: ${irrPercent.toFixed(1)}% — ${irrVerdict}.`;

  return {
    totalInvestment,
    annualSalaryGain,
    simplePaybackYears,
    npvAt10Years,
    irrPercent,
    loanMonthlyPayment,
    breakEvenYear,
    summaryText,
  };
}
