export interface Inputs {
  capital: number;
  rate: number;
  term: number;
  term_unit: string;
  currency: string;
}

export interface Outputs {
  interest_simple: number;
  total_amount: number;
  interest_compound: number;
  difference: number;
  effective_rate: number;
  alert: string;
}

// Umbral en años a partir del cual se emite advertencia sobre diferencia simple vs compuesto
const ALERT_THRESHOLD_YEARS = 2;
// Umbral de diferencia relativa (%) para considerar la diferencia "significativa"
const ALERT_DIFF_PERCENT = 5;

export function compute(i: Inputs): Outputs {
  const capital = Number(i.capital) || 0;
  const ratePercent = Number(i.rate) || 0;
  const term = Number(i.term) || 0;
  const term_unit = i.term_unit || "months";

  // Validaciones básicas
  if (capital <= 0 || ratePercent <= 0 || term <= 0) {
    return {
      interest_simple: 0,
      total_amount: 0,
      interest_compound: 0,
      difference: 0,
      effective_rate: 0,
      alert: "Ingresa valores positivos para capital, tasa y plazo."
    };
  }

  // Tasa anual en decimal
  const annualRate = ratePercent / 100;

  // Convertir plazo a años según la unidad seleccionada
  let termYears: number;
  if (term_unit === "days") {
    termYears = term / 365;
  } else if (term_unit === "months") {
    termYears = term / 12;
  } else {
    // years
    termYears = term;
  }

  // --- Interés simple ---
  // Fórmula: I = C · i · t
  const interest_simple = capital * annualRate * termYears;
  const total_amount = capital + interest_simple;

  // --- Interés compuesto (capitalización anual) ---
  // Fórmula: M = C · (1 + i)^t  →  I_compuesto = M - C
  const compound_total = capital * Math.pow(1 + annualRate, termYears);
  const interest_compound = compound_total - capital;

  // --- Diferencia ---
  const difference = interest_compound - interest_simple;

  // --- Tasa efectiva del período (%) ---
  // Representa cuánto porcentaje del capital inicial se paga de interés simple en total
  const effective_rate = (interest_simple / capital) * 100;

  // --- Alerta cuando la diferencia es significativa ---
  let alert = "";
  const diffRelative = interest_simple > 0 ? (difference / interest_simple) * 100 : 0;

  if (termYears > ALERT_THRESHOLD_YEARS && diffRelative > ALERT_DIFF_PERCENT) {
    const diffFormatted = difference.toFixed(2);
    alert =
      `A ${termYears.toFixed(1)} años, el interés compuesto supera al simple en ` +
      `${diffFormatted} (${diffRelative.toFixed(1)}%). ` +
      `Para plazos mayores a ${ALERT_THRESHOLD_YEARS} años, verifica qué tipo de interés aplica tu contrato.`;
  } else if (termYears <= 1 / 12) {
    alert = "Plazo muy corto (menos de 1 mes). La diferencia entre simple y compuesto es despreciable.";
  } else {
    alert = `Diferencia vs interés compuesto: ${difference.toFixed(2)} (${diffRelative.toFixed(2)}% sobre el interés simple).`;
  }

  return {
    interest_simple,
    total_amount,
    interest_compound,
    difference,
    effective_rate,
    alert
  };
}
