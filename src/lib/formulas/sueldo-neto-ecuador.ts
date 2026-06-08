/** Sueldo neto (Ecuador) — bruto menos aporte personal IESS (9,45%). */
import { ECUADOR_2026, fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  sueldoBruto: number;
  otrosDescuentos?: number; // anticipos, préstamos, etc. (opcional)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const bruto = Number(i.sueldoBruto) || 0;
  const otros = Math.max(0, Number(i.otrosDescuentos) || 0);
  if (bruto <= 0) throw new Error('Ingresá tu sueldo bruto mensual');

  const aporteIESS = bruto * ECUADOR_2026.iessPersonal; // 9,45%
  const neto = bruto - aporteIESS - otros;
  const pctNeto = bruto > 0 ? (neto / bruto) * 100 : 0;

  const _insight = {
    title: 'Tu sueldo neto',
    text: `De un sueldo bruto de **${fmtUSDec(bruto)}** se descuenta el aporte personal al IESS de **9,45%** (${fmtUSDec(aporteIESS)})${otros > 0 ? ` más ${fmtUSDec(otros)} de otros descuentos` : ''}. Tu sueldo neto es **${fmtUSDec(neto)}** (${pctNeto.toFixed(1)}% del bruto).`,
    tone: 'good',
    icon: '💵',
  };
  const _chart = {
    type: 'donut',
    segments: [
      { label: 'Neto', value: Math.round(neto * 100) / 100 },
      { label: 'Aporte IESS', value: Math.round(aporteIESS * 100) / 100 },
      ...(otros > 0 ? [{ label: 'Otros descuentos', value: Math.round(otros * 100) / 100 }] : []),
    ],
    label: fmtUSDec(neto),
    ariaLabel: `Sueldo neto ${fmtUSDec(neto)} de un bruto de ${fmtUSDec(bruto)}.`,
  };

  return {
    sueldoNeto: fmtUSDec(neto),
    aporteIESS: fmtUSDec(aporteIESS),
    sueldoBruto: fmtUSDec(bruto),
    detalle: `Bruto ${fmtUSDec(bruto)} − IESS 9,45% (${fmtUSDec(aporteIESS)})${otros > 0 ? ` − otros ${fmtUSDec(otros)}` : ''} = ${fmtUSDec(neto)}.`,
    _insight,
    _chart,
  };
}
