/**
 * Calculadora de ROAS (Return On Ad Spend)
 * ROAS = ingresos generados / inversión en publicidad
 * También: rentabilidad publicitaria = ROAS × margen neto por venta
 */

export interface RoasInputs {
  ingresos: number;
  inversion: number;
  margenBruto: number; // % (opcional, para ROAS neto)
}

export interface RoasOutputs {
  roas: number;
  roasX: string; // "3.5×"
  roasPorcentaje: number;
  ganancia: number;
  gananciaNetaAprox: number;
  breakEvenROAS: number;
  benchmark: string;
}

export function marketingRoas(inputs: RoasInputs): RoasOutputs {
  const ingresos = Number(inputs.ingresos);
  const inversion = Number(inputs.inversion);
  const margen = Math.max(0, Math.min(100, Number(inputs.margenBruto) || 0));

  if (!ingresos || ingresos <= 0) throw new Error('Ingresá los ingresos generados');
  if (!inversion || inversion <= 0) throw new Error('Ingresá la inversión publicitaria');

  const roas = ingresos / inversion;
  const roasPorcentaje = roas * 100;
  const ganancia = ingresos - inversion;

  // ROAS break-even: 1 / margen_bruto
  const breakEvenROAS = margen > 0 ? 100 / margen : 0;

  // Ganancia neta aproximada = (ingresos × margen) - inversion
  const gananciaNetaAprox = margen > 0 ? ingresos * (margen / 100) - inversion : 0;

  let benchmark = '';
  if (roas >= 5) benchmark = '🚀 Excepcional — escalá la inversión';
  else if (roas >= 3) benchmark = '✅ Muy bueno — rentable';
  else if (roas >= 2) benchmark = '⚡ Aceptable — rentable si el margen es alto';
  else if (roas >= 1) benchmark = '⚠️ Marginal — recuperás la inversión pero no ganás';
  else benchmark = '🔴 Negativo — estás perdiendo plata en ads';

  return {
    roas: Math.round(roas * 100) / 100,
    roasX: `${(Math.round(roas * 10) / 10).toFixed(1)}×`,
    roasPorcentaje: Math.round(roasPorcentaje * 10) / 10,
    ganancia: Math.round(ganancia),
    gananciaNetaAprox: Math.round(gananciaNetaAprox),
    breakEvenROAS: Math.round(breakEvenROAS * 100) / 100,
    benchmark,
  };
}
