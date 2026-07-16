// Crédito automotriz (Chile) — cuota mensual, CAE y costo total a partir del valor del auto, pie y plazo.
import { fmtCLP } from '../data/chile-2026.ts';

export interface Inputs {
  valorAuto: number;    // precio del vehículo (CLP)
  pie: number;          // pie / cuota inicial (CLP)
  plazoMeses: number;   // número de cuotas
  caeAnual: number;     // Carga Anual Equivalente (%)
}
export interface Outputs {
  montoFinanciar: number;
  cuotaMensual: number;
  totalCuotas: number;
  totalIntereses: number;
  costoTotal: number;
  excedeTasaMaxima: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

const TASA_MAXIMA_CONVENCIONAL_CMF = 32;  // % anual referencial (CMF, tramos > 200 UF a 1 año).

export function compute(i: Inputs): Outputs {
  const valor = Math.max(0, Number(i.valorAuto) || 0);
  const pie = Math.max(0, Math.min(valor, Number(i.pie) || 0));
  const meses = Math.max(1, Math.min(84, Math.round(Number(i.plazoMeses) || 1)));
  const cae = Math.max(0, Math.min(60, Number(i.caeAnual) || 0));

  const monto = Math.max(0, valor - pie);
  const r = cae / 100 / 12;

  let cuota: number;
  if (monto === 0) {
    cuota = 0;
  } else if (r === 0) {
    cuota = monto / meses;
  } else {
    const factor = Math.pow(1 + r, meses);
    cuota = monto * ((r * factor) / (factor - 1));
  }

  const totalCuotas = cuota * meses;
  const totalIntereses = Math.max(0, totalCuotas - monto);
  const costoTotal = pie + totalCuotas;  // lo que terminás desembolsando por el auto

  const excede = cae > TASA_MAXIMA_CONVENCIONAL_CMF;
  const excedeTasaMaxima = excede
    ? `Sí (${cae.toLocaleString('es-CL')}% > ${TASA_MAXIMA_CONVENCIONAL_CMF}%)`
    : `No (${cae.toLocaleString('es-CL')}% ≤ ${TASA_MAXIMA_CONVENCIONAL_CMF}%)`;

  const sobrecostoPct = monto > 0 ? (totalIntereses / monto) * 100 : 0;

  const _insight = {
    title: `Cuota mensual: ${fmtCLP(cuota)}`,
    text: monto === 0
      ? 'El pie cubre el valor del auto: no necesitás financiar nada.'
      : `Financiás **${fmtCLP(monto)}** en ${meses} cuotas de **${fmtCLP(cuota)}**. Vas a pagar **${fmtCLP(totalIntereses)}** solo de intereses (un ${Math.round(sobrecostoPct)}% sobre el monto financiado), y el auto te costará en total **${fmtCLP(costoTotal)}** sumando el pie.`,
    tone: excede ? 'warn' : (sobrecostoPct > 40 ? 'warn' : 'neutral'),
    icon: '🚗',
  };

  const _chart = monto > 0 ? {
    type: 'doughnut' as const,
    slices: [
      { label: 'Monto financiado', value: Math.round(monto) },
      { label: 'Intereses', value: Math.round(totalIntereses) },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: fmtCLP(totalCuotas),
    centerLabel: 'Total del crédito',
    ariaLabel: `Total del crédito ${fmtCLP(totalCuotas)}: monto financiado ${fmtCLP(monto)} más intereses ${fmtCLP(totalIntereses)}.`,
  } : undefined;

  return {
    montoFinanciar: Math.round(monto),
    cuotaMensual: Math.round(cuota),
    totalCuotas: Math.round(totalCuotas),
    totalIntereses: Math.round(totalIntereses),
    costoTotal: Math.round(costoTotal),
    excedeTasaMaxima,
    detalle: `Financiás ${fmtCLP(monto)} a ${meses} meses con CAE ${cae.toLocaleString('es-CL')}%: cuota ${fmtCLP(cuota)}, intereses ${fmtCLP(totalIntereses)}.`,
    _insight,
    _chart,
  };
}
