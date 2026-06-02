/** Dividir gastos de pareja proporcional al ingreso */

export interface Inputs {
  ingresoA: number;
  ingresoB: number;
  gastoTotal: number;
}

export interface Outputs {
  pagoA: number;
  pagoB: number;
  porcentajeA: number;
  porcentajeB: number;
  _insight?: any;
  _chart?: any;
}

export function splitGastosPareja(i: Inputs): Outputs {
  const ingresoA = Number(i.ingresoA);
  const ingresoB = Number(i.ingresoB);
  const gastoTotal = Number(i.gastoTotal);

  if (isNaN(ingresoA) || ingresoA < 0) throw new Error('Ingresá un ingreso válido para Persona A');
  if (isNaN(ingresoB) || ingresoB < 0) throw new Error('Ingresá un ingreso válido para Persona B');
  if (!gastoTotal || gastoTotal <= 0) throw new Error('Ingresá el gasto total a dividir');

  const ingresoTotal = ingresoA + ingresoB;
  if (ingresoTotal <= 0) throw new Error('Al menos una persona debe tener ingreso mayor a 0');

  const porcentajeA = (ingresoA / ingresoTotal) * 100;
  const porcentajeB = (ingresoB / ingresoTotal) * 100;
  const pagoA = gastoTotal * (ingresoA / ingresoTotal);
  const pagoB = gastoTotal * (ingresoB / ingresoTotal);

  const pagoAR = Math.round(pagoA);
  const pagoBR = Math.round(pagoB);
  const pctAR = Number(porcentajeA.toFixed(2));
  const pctBR = Number(porcentajeB.toFixed(2));
  const fmt = (n: number) => '$' + n.toLocaleString('es-AR');
  const cierre = ingresoA === ingresoB
    ? 'Como ganan lo mismo, el gasto se parte por la mitad.'
    : `Persona **${ingresoA > ingresoB ? 'A' : 'B'}**, que gana más, aporta la parte mayor.`;
  const _insight = {
    title: 'Reparto proporcional al ingreso',
    text: `Persona A pone **${fmt(pagoAR)}** (**${pctAR}%**) y Persona B **${fmt(pagoBR)}** (**${pctBR}%**) de los **${fmt(Math.round(gastoTotal))}**. ${cierre}`,
    tone: 'neutral' as const,
    icon: '💑',
  };
  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Persona A', value: Math.round(pagoA) },
      { label: 'Persona B', value: Math.round(gastoTotal) - Math.round(pagoA) },
    ],
    prefix: '$',
    centerValue: fmt(Math.round(gastoTotal)),
    centerLabel: 'Gasto total',
    ariaLabel: `Reparto del gasto: Persona A ${fmt(pagoAR)}, Persona B ${fmt(pagoBR)}`,
  };
  return {
    pagoA: pagoAR,
    pagoB: pagoBR,
    porcentajeA: pctAR,
    porcentajeB: pctBR,
    _insight,
    _chart,
  };
}
