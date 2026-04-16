/**
 * Calculadora de Cuota Alimentaria para Hijos - Argentina
 * Estimación orientativa basada en criterios judiciales habituales
 * CCyCN Arts. 658-670
 */

export interface CuotaAlimentariaInputs {
  ingresoNeto: number;
  cantidadHijos: number;
  edadMayor: string;
}

export interface CuotaAlimentariaOutputs {
  cuotaEstimada: number;
  rangoMinimo: number;
  rangoMaximo: number;
  porcentajeIngreso: string;
}

export function cuotaAlimentariaHijos(inputs: CuotaAlimentariaInputs): CuotaAlimentariaOutputs {
  const ingreso = Number(inputs.ingresoNeto);
  const hijos = Math.max(1, Number(inputs.cantidadHijos) || 1);
  const edad = inputs.edadMayor || '6-12';

  if (!ingreso || ingreso <= 0) {
    throw new Error('Ingresá el ingreso neto mensual del alimentante');
  }

  // Porcentajes base por cantidad de hijos (jurisprudencia habitual)
  const rangos: Record<number, [number, number]> = {
    1: [0.25, 0.30],
    2: [0.30, 0.40],
    3: [0.35, 0.45],
    4: [0.40, 0.50],
    5: [0.45, 0.55],
  };

  let [porcMin, porcMax] = rangos[Math.min(hijos, 5)] || [0.25, 0.30];

  // Ajuste por edad: adolescentes y mayores tienen más gastos
  if (edad === '13-17') {
    porcMin += 0.03;
    porcMax += 0.03;
  } else if (edad === '18-21') {
    porcMin += 0.05;
    porcMax += 0.05;
  } else if (edad === '0-5') {
    porcMin -= 0.02;
    porcMax -= 0.02;
  }

  const rangoMinimo = ingreso * porcMin;
  const rangoMaximo = ingreso * porcMax;
  const cuotaEstimada = (rangoMinimo + rangoMaximo) / 2;
  const porcMedio = ((porcMin + porcMax) / 2 * 100).toFixed(0);

  return {
    cuotaEstimada: Math.round(cuotaEstimada),
    rangoMinimo: Math.round(rangoMinimo),
    rangoMaximo: Math.round(rangoMaximo),
    porcentajeIngreso: `${(porcMin * 100).toFixed(0)}% - ${(porcMax * 100).toFixed(0)}% (estimado ~${porcMedio}%)`,
  };
}
