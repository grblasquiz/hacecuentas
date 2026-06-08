/** AFP vs ONP Perú — comparación del descuento de pensión y el sueldo neto resultante. */
import { PERU_2026, fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  sueldoBruto: number;
  tieneHijos?: string;       // 'si' suma asignación familiar al bruto
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const base = Number(i.sueldoBruto) || 0;
  const conHijos = String(i.tieneHijos || 'no') === 'si';
  if (base <= 0) throw new Error('Ingresá tu sueldo bruto mensual');

  const asig = conHijos ? PERU_2026.asignacionFamiliar : 0;
  const bruto = base + asig;

  // ONP: 13% único. AFP: ~12,5% (10% fondo + ~1,74% prima de seguro + comisión por flujo).
  const descuentoOnp = bruto * PERU_2026.onp;
  const descuentoAfp = bruto * PERU_2026.afp.totalAprox;
  const netoOnp = bruto - descuentoOnp;
  const netoAfp = bruto - descuentoAfp;

  const diferencia = Math.abs(netoAfp - netoOnp);
  const masConviene = netoAfp >= netoOnp ? 'AFP' : 'ONP';

  const _insight = {
    title: 'AFP vs ONP en tu bolsillo',
    text: `Sobre un bruto de **${fmtPEN(bruto)}**: con **ONP (13%)** te descuentan **${fmtPEN(descuentoOnp)}** y te queda **${fmtPEN(netoOnp)}**; con **AFP (~12,5%)** te descuentan **${fmtPEN(descuentoAfp)}** y te queda **${fmtPEN(netoAfp)}**. Hoy en tu boleta conviene **${masConviene}** por **${fmtPEN(diferencia)}** al mes, pero el ONP solo paga pensión con 20 años de aportes, mientras que en AFP el fondo es tuyo y heredable.`,
    tone: 'good',
    icon: '⚖️',
  };
  const _chart = {
    type: 'bar',
    labels: ['Neto ONP', 'Neto AFP'],
    values: [Math.round(netoOnp), Math.round(netoAfp)],
    prefix: 'S/ ',
    ariaLabel: `Sueldo neto con ONP ${fmtPEN(netoOnp)} frente a AFP ${fmtPEN(netoAfp)}.`,
  };

  return {
    netoOnp: fmtPEN(netoOnp),
    netoAfp: fmtPEN(netoAfp),
    descuentoOnp: fmtPEN(descuentoOnp),
    descuentoAfp: fmtPEN(descuentoAfp),
    detalle: `ONP descuenta ${fmtPEN(descuentoOnp)} (neto ${fmtPEN(netoOnp)}) · AFP descuenta ${fmtPEN(descuentoAfp)} (neto ${fmtPEN(netoAfp)}).`,
    _insight,
    _chart,
  };
}
