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
  _insight?: any;
  _chart?: any;
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
  const porcMedioNum = (porcMin + porcMax) / 2 * 100;
  const porcMedio = porcMedioNum.toFixed(0);

  const fmt = (x: number) => '$' + Math.round(x).toLocaleString('es-AR');
  const hijosStr = hijos === 1 ? '1 hijo' : `${hijos} hijos`;
  const resto = Math.max(0, ingreso - cuotaEstimada);
  const _insight = {
    title: 'Cuota orientativa',
    text: `Para ${hijosStr}, la cuota estimada ronda los **${fmt(cuotaEstimada)}/mes** (**~${porcMedio}%** del ingreso neto), en un rango de ${fmt(rangoMinimo)} a ${fmt(rangoMaximo)}. Es una referencia según criterios judiciales (CCyCN arts. 658-670); el monto final lo fija el juez.`,
    tone: porcMedioNum >= 45 ? 'warn' : 'neutral',
    icon: '⚖️',
  };

  // Donut: el ingreso neto se reparte entre la cuota y el resto disponible
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Cuota alimentaria', value: Math.round(cuotaEstimada) },
      { label: 'Resto del ingreso', value: Math.round(resto) },
    ],
    prefix: '$',
    centerValue: fmt(ingreso),
    centerLabel: 'Ingreso neto',
    ariaLabel: `Del ingreso neto de ${fmt(ingreso)}, la cuota estimada es ${fmt(cuotaEstimada)} y el resto ${fmt(resto)}`,
  };

  return {
    cuotaEstimada: Math.round(cuotaEstimada),
    rangoMinimo: Math.round(rangoMinimo),
    rangoMaximo: Math.round(rangoMaximo),
    porcentajeIngreso: `${(porcMin * 100).toFixed(0)}% - ${(porcMax * 100).toFixed(0)}% (estimado ~${porcMedio}%)`,
    _insight,
    _chart,
  };
}
