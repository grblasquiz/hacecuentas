// Calculadora 1RM – Estimación Fuerza Máxima
// Fórmulas: Epley (1985) y Brzycki (1993)
// Fuente validación: LeSuer et al. (1997) JSCR

export interface Inputs {
  weight: number;   // peso levantado en la unidad seleccionada
  reps: number;     // repeticiones realizadas (idealmente 1-10)
  unit: string;     // 'kg' | 'lb'
}

export interface Outputs {
  orm_epley: number;
  orm_brzycki: number;
  orm_average: number;
  pct_50: number;
  pct_60: number;
  pct_70: number;
  pct_80: number;
  pct_85: number;
  pct_90: number;
  pct_95: number;
  unit_label: string;
  warning: string;
}

/** Redondea al múltiplo más cercano de 0.5 (práctico para discos) */
function round05(value: number): number {
  return Math.round(value * 2) / 2;
}

export function compute(i: Inputs): Outputs {
  const weight = Number(i.weight) || 0;
  const reps = Math.round(Number(i.reps) || 0);
  const unit = i.unit === "lb" ? "lb" : "kg";

  // Validaciones defensivas
  if (weight <= 0 || reps <= 0) {
    return {
      orm_epley: 0,
      orm_brzycki: 0,
      orm_average: 0,
      pct_50: 0,
      pct_60: 0,
      pct_70: 0,
      pct_80: 0,
      pct_85: 0,
      pct_90: 0,
      pct_95: 0,
      unit_label: unit,
      warning: "Ingresa un peso y un número de repeticiones válidos (ambos mayores que cero)."
    };
  }

  if (reps > 30) {
    return {
      orm_epley: 0,
      orm_brzycki: 0,
      orm_average: 0,
      pct_50: 0,
      pct_60: 0,
      pct_70: 0,
      pct_80: 0,
      pct_85: 0,
      pct_90: 0,
      pct_95: 0,
      unit_label: unit,
      warning: "El número de repeticiones es demasiado alto para una estimación confiable. Usa entre 1 y 10 repeticiones."
    };
  }

  // --- Fórmula de Epley (1985) ---
  // 1RM = peso × (1 + reps / 30)
  const orm_epley_raw = weight * (1 + reps / 30);

  // --- Fórmula de Brzycki (1993) ---
  // 1RM = peso × 36 / (37 − reps)
  // Nota: si reps === 37 hay división por cero; protegido arriba con reps <= 30
  const orm_brzycki_raw = weight * 36 / (37 - reps);

  // --- Promedio de ambas estimaciones ---
  const orm_average_raw = (orm_epley_raw + orm_brzycki_raw) / 2;

  // Redondear a 0.5 para uso práctico en barra
  const orm_epley = round05(orm_epley_raw);
  const orm_brzycki = round05(orm_brzycki_raw);
  const orm_average = round05(orm_average_raw);

  // --- Tabla de porcentajes (basada en el promedio) ---
  const base = orm_average_raw; // usamos el valor sin redondear para los %
  const pct_50 = round05(base * 0.50);
  const pct_60 = round05(base * 0.60);
  const pct_70 = round05(base * 0.70);
  const pct_80 = round05(base * 0.80);
  const pct_85 = round05(base * 0.85);
  const pct_90 = round05(base * 0.90);
  const pct_95 = round05(base * 0.95);

  // --- Advertencia por rango de repeticiones ---
  let warning = "";
  if (reps === 1) {
    warning = "Con 1 repetición el peso ingresado ya es tu 1RM real. La estimación confirma ese valor con una diferencia mínima (<3.4%)."
  } else if (reps > 10) {
    warning = `Con ${reps} repeticiones el error de estimación puede superar el 10%. Para mayor precisión, usa una carga que te permita completar entre 3 y 6 repeticiones al fallo técnico.`;
  }

  return {
    orm_epley,
    orm_brzycki,
    orm_average,
    pct_50,
    pct_60,
    pct_70,
    pct_80,
    pct_85,
    pct_90,
    pct_95,
    unit_label: unit,
    warning
  };
}
