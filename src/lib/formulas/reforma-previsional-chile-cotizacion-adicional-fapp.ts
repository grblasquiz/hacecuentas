// Reforma previsional (Chile, Ley 21.735) — cotización adicional de cargo del empleador.
// Sube gradualmente desde 1% (agosto 2025) hasta 7% en 9 años; con el 1,5% del SIS, el empleador
// llega a aportar 8,5%. Tope imponible AFP 90 UF (src/lib/data/chile-2026.ts).
import { CHILE_2026, fmtCLP } from '../data/chile-2026.ts';

export interface Inputs {
  sueldoBruto: number;   // remuneración imponible mensual (CLP)
  tasaAdicional: number; // % de cotización adicional vigente (1,0 desde ago-2025)
  valorUF: number;       // valor de la UF para el tope de 90 UF (CLP)
}
export interface Outputs {
  baseImponible: number;
  aporteMensual: number;
  aporteAnual: number;
  aporteFinal7: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

const TASA_FINAL = 7;   // % adicional al que llega la reforma (endpoint).
const UF_FALLBACK = 40_844.79;

export function compute(i: Inputs): Outputs {
  const sueldo = Math.max(0, Number(i.sueldoBruto) || 0);
  const tasa = Math.max(0, Math.min(7, Number(i.tasaAdicional) || 1));
  const uf = Number(i.valorUF) > 0 ? Number(i.valorUF) : UF_FALLBACK;

  // Base imponible topada en 90 UF (tope AFP).
  const tope = CHILE_2026.topeImponibleAfpUf * uf;
  const base = Math.min(sueldo, tope);

  const aporteMensual = Math.round(base * (tasa / 100));
  const aporteAnual = aporteMensual * 12;
  const aporteFinal7 = Math.round(base * (TASA_FINAL / 100));

  const topado = sueldo > tope;
  const _insight = {
    title: `Aporte del empleador: ${fmtCLP(aporteMensual)}/mes`,
    text: `Con una remuneración imponible de **${fmtCLP(base)}**${topado ? ` (topada en 90 UF = ${fmtCLP(tope)})` : ''}, la cotización adicional del **${tasa.toLocaleString('es-CL')}%** que paga tu empleador es **${fmtCLP(aporteMensual)}** al mes (**${fmtCLP(aporteAnual)}** al año). Cuando la reforma llegue al 7%, ese aporte será de **${fmtCLP(aporteFinal7)}** mensuales. No sale de tu bolsillo: lo paga el empleador además de tu 10% de AFP.`,
    tone: 'good',
    icon: '📈',
  };

  const _chart = {
    type: 'bars',
    bars: [
      { label: `Hoy (${tasa.toLocaleString('es-CL')}%)`, value: aporteMensual, color: '#2563eb', colorDark: '#3b82f6' },
      { label: 'Final (7%)', value: aporteFinal7, color: '#16a34a', colorDark: '#22c55e' },
    ],
    valueFormat: 'currency',
    ariaLabel: `Aporte adicional del empleador: hoy ${fmtCLP(aporteMensual)}, al final de la reforma ${fmtCLP(aporteFinal7)}.`,
  };

  return {
    baseImponible: Math.round(base),
    aporteMensual,
    aporteAnual,
    aporteFinal7,
    detalle: `${tasa.toLocaleString('es-CL')}% de ${fmtCLP(base)} = ${fmtCLP(aporteMensual)}/mes (al 7% serían ${fmtCLP(aporteFinal7)}).`,
    _insight,
    _chart,
  };
}
