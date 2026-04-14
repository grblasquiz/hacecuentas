/**
 * Calculadora de Plazo Fijo Argentina
 *
 * Fórmula estándar: interés simple sobre TNA
 *   interés = capital × (TNA/100) × (días / 365)
 *   monto_final = capital + interés
 *
 * TEA (Tasa Efectiva Anual): (1 + TNA/365)^365 - 1 (capitalización diaria teórica)
 * Rendimiento efectivo del plazo = (monto_final/capital - 1) × 100
 */

export interface PlazoFijoInputs {
  capital: number;
  tna: number; // Tasa Nominal Anual en %
  dias: number; // 30, 60, 90, 180, 365...
}

export interface PlazoFijoOutputs {
  interesGanado: number;
  montoFinal: number;
  rendimientoPeriodo: number; // % del período
  tea: number; // tasa efectiva anual %
  interesDiario: number;
  interesMensualEq: number; // tasa mensual equivalente
}

export function plazoFijo(inputs: PlazoFijoInputs): PlazoFijoOutputs {
  const capital = Number(inputs.capital);
  const tna = Number(inputs.tna);
  const dias = Number(inputs.dias);

  if (!capital || capital <= 0) throw new Error('Ingresá el capital a invertir');
  if (!tna || tna <= 0) throw new Error('Ingresá la TNA (tasa nominal anual)');
  if (!dias || dias < 1) throw new Error('Ingresá los días del plazo (mínimo 30)');

  const tnaDecimal = tna / 100;
  const interesGanado = capital * tnaDecimal * (dias / 365);
  const montoFinal = capital + interesGanado;
  const rendimientoPeriodo = (interesGanado / capital) * 100;

  // TEA: (1 + TNA/365)^365 - 1 (interés compuesto diario teórico)
  const tea = (Math.pow(1 + tnaDecimal / 365, 365) - 1) * 100;

  const interesDiario = interesGanado / dias;
  const interesMensualEq = capital * tnaDecimal * (30 / 365);

  return {
    interesGanado: Math.round(interesGanado),
    montoFinal: Math.round(montoFinal),
    rendimientoPeriodo: Number(rendimientoPeriodo.toFixed(2)),
    tea: Number(tea.toFixed(2)),
    interesDiario: Math.round(interesDiario),
    interesMensualEq: Math.round(interesMensualEq),
  };
}
