/**
 * Calculadora de cuota alimentaria (estimación orientativa)
 * Basada en criterios de jurisprudencia argentina
 * DISCLAIMER: no es un cálculo legal vinculante
 */

export interface CuotaAlimentariaEstimacionInputs {
  ingresoNetoObligado: number;
  cantidadHijos: number;
  necesidadesEspeciales: string;
}

export interface CuotaAlimentariaEstimacionOutputs {
  cuotaEstimada: number;
  rangoMinMax: string;
  porcentajeIngreso: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function cuotaAlimentariaEstimacion(
  inputs: CuotaAlimentariaEstimacionInputs
): CuotaAlimentariaEstimacionOutputs {
  const ingreso = Number(inputs.ingresoNetoObligado);
  const hijos = Number(inputs.cantidadHijos) || 1;
  const necesidadesEsp = inputs.necesidadesEspeciales === 'si';

  if (!ingreso || ingreso <= 0) throw new Error('Ingresá el ingreso neto mensual');

  // Porcentajes orientativos por cantidad de hijos
  let pctMin: number;
  let pctMax: number;
  let pctMedio: number;

  switch (true) {
    case hijos === 1:
      pctMin = 20;
      pctMax = 30;
      pctMedio = 25;
      break;
    case hijos === 2:
      pctMin = 30;
      pctMax = 40;
      pctMedio = 35;
      break;
    case hijos === 3:
      pctMin = 35;
      pctMax = 45;
      pctMedio = 40;
      break;
    default: // 4+
      pctMin = 40;
      pctMax = 50;
      pctMedio = 45;
  }

  // Necesidades especiales incrementan un ~10%
  if (necesidadesEsp) {
    pctMin += 5;
    pctMax += 10;
    pctMedio += 7;
  }

  // Tope práctico del 50%
  pctMax = Math.min(pctMax, 55);
  pctMedio = Math.min(pctMedio, 50);

  const cuotaEstimada = ingreso * (pctMedio / 100);
  const cuotaMin = ingreso * (pctMin / 100);
  const cuotaMax = ingreso * (pctMax / 100);

  const hijosStr = hijos === 1 ? '1 hijo' : `${hijos} hijos`;
  const espStr = necesidadesEsp ? ' con necesidades especiales' : '';

  const fmt = (x: number) => '$' + Math.round(x).toLocaleString('es-AR');
  const resto = Math.max(0, ingreso - cuotaEstimada);
  const _insight = {
    title: 'Cuota orientativa',
    text: `Para ${hijosStr}${espStr}, la cuota estimada ronda los **${fmt(cuotaEstimada)}/mes** (**${pctMedio}%** del ingreso neto), dentro de un rango de ${fmt(cuotaMin)} a ${fmt(cuotaMax)}. Es una referencia: el monto final lo fija el juez.`,
    tone: pctMedio >= 45 ? 'warn' : 'neutral',
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
    rangoMinMax: `$${Math.round(cuotaMin).toLocaleString('es-AR')} — $${Math.round(cuotaMax).toLocaleString('es-AR')}`,
    porcentajeIngreso: `${pctMedio}% del ingreso neto (rango: ${pctMin}%-${pctMax}%)`,
    detalle: `Estimación orientativa para ${hijosStr}${espStr} con ingreso neto de $${Math.round(ingreso).toLocaleString('es-AR')}: cuota ~$${Math.round(cuotaEstimada).toLocaleString('es-AR')}/mes (${pctMedio}%). Rango: $${Math.round(cuotaMin).toLocaleString('es-AR')} a $${Math.round(cuotaMax).toLocaleString('es-AR')} (${pctMin}%-${pctMax}%). IMPORTANTE: esta es una estimación basada en jurisprudencia. El monto real lo define el juez según cada caso.`,
    _insight,
    _chart,
  };
}
