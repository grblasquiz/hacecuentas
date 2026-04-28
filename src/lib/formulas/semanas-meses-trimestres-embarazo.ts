// Conversor semanas/días de embarazo → mes, trimestre, % completado, días restantes
// Fuente: ACOG Committee Opinion (2013), OMS ICD-11 (2025)

export interface Inputs {
  weeks: number; // semana actual (1–40)
  days: number;  // días dentro de esa semana (0–6)
}

export interface Outputs {
  monthLabel: string;
  trimesterLabel: string;
  percentComplete: number;
  daysRemaining: number;
  weeksRemaining: string;
  totalDaysElapsed: number;
}

// Duración estándar del embarazo según ACOG/OMS
const TOTAL_DAYS = 280; // 40 semanas × 7 días

// Límites de meses obstétricos (en días transcurridos desde día 0)
// Cada mes tiene 28 días (4 semanas), excepto el 9.° que tiene 36 días
// para completar exactamente 280 días.
// Mes N: días desde (N-1)*28 hasta N*28 - 1, con mes 9 hasta 280
function getObstetricMonth(daysElapsed: number): number {
  if (daysElapsed < 0) return 0;
  if (daysElapsed < 28)  return 1;  // semanas 1–4+6
  if (daysElapsed < 56)  return 2;  // semanas 5–8+6
  if (daysElapsed < 84)  return 3;  // semanas 9–12+6 (ajuste: hasta 13+6 clínico)
  if (daysElapsed < 112) return 4;  // semanas 13–16+6 → mes 4 desde día 84
  if (daysElapsed < 140) return 5;  // semanas 17–20+6
  if (daysElapsed < 168) return 6;  // semanas 21–24+6 (hasta día 167)
  if (daysElapsed < 196) return 7;  // semanas 25–28+6 → día 168–195
  if (daysElapsed < 224) return 8;  // semanas 29–32+6 → día 196–223
  return 9;                          // semanas 33–40 → día 224–280
}

// Trimestres según ACOG: 1.° sem 1–13+6, 2.° sem 14–27+6, 3.° sem 28–40
function getTrimester(daysElapsed: number): number {
  // Fin 1er tri: semana 13+6 = 13*7+6 = 97 días transcurridos
  // Fin 2do tri: semana 27+6 = 27*7+6 = 195 días transcurridos
  if (daysElapsed <= 97)  return 1;
  if (daysElapsed <= 195) return 2;
  return 3;
}

const ORDINALS_ES = [
  "", "1.°", "2.°", "3.°", "4.°", "5.°", "6.°", "7.°", "8.°", "9.°"
];

export function compute(i: Inputs): Outputs {
  const weeks = Math.floor(Number(i.weeks) || 0);
  const days  = Math.min(6, Math.max(0, Math.floor(Number(i.days) || 0)));

  // Validación de rango
  if (weeks < 1 || weeks > 45) {
    return {
      monthLabel: "Ingresa una semana entre 1 y 45",
      trimesterLabel: "—",
      percentComplete: 0,
      daysRemaining: 0,
      weeksRemaining: "—",
      totalDaysElapsed: 0
    };
  }

  // Días transcurridos: la semana 1 día 0 = 0 días desde inicio
  // semana N día D → (N-1)*7 + D días transcurridos
  const totalDaysElapsed = (weeks - 1) * 7 + days;

  // Porcentaje completado sobre 280 días (FPP estándar)
  const rawPercent = (totalDaysElapsed / TOTAL_DAYS) * 100;
  const percentComplete = Math.min(100, parseFloat(rawPercent.toFixed(1)));

  // Días restantes
  const daysRemaining = Math.max(0, TOTAL_DAYS - totalDaysElapsed);

  // Semanas + días restantes
  const weeksLeft = Math.floor(daysRemaining / 7);
  const daysLeft  = daysRemaining % 7;
  let weeksRemaining: string;
  if (daysRemaining === 0) {
    weeksRemaining = "¡Fecha probable de parto alcanzada!";
  } else if (weeksLeft === 0) {
    weeksRemaining = `${daysLeft} día${daysLeft !== 1 ? "s" : ""}`;
  } else if (daysLeft === 0) {
    weeksRemaining = `${weeksLeft} semana${weeksLeft !== 1 ? "s" : ""}  exactas`;
  } else {
    weeksRemaining = `${weeksLeft} sem. + ${daysLeft} día${daysLeft !== 1 ? "s" : ""}`;
  }

  // Mes obstétrico
  const monthNum = getObstetricMonth(totalDaysElapsed);
  const monthLabel = `${ORDINALS_ES[monthNum]} mes (semana ${weeks}+${days})`;

  // Trimestre
  const triNum = getTrimester(totalDaysElapsed);
  const triNames = ["1.° trimestre (semanas 1–13+6)", "2.° trimestre (semanas 14–27+6)", "3.° trimestre (semanas 28–40)"];
  const trimesterLabel = triNames[triNum - 1];

  return {
    monthLabel,
    trimesterLabel,
    percentComplete,
    daysRemaining,
    weeksRemaining,
    totalDaysElapsed
  };
}
