/** IVA (Ecuador) — agregar o quitar el 15% sobre un monto. */
import { ECUADOR_2026, fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  monto: number;
  modo?: string; // 'agregar' (monto = base sin IVA) | 'quitar' (monto = total con IVA)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const monto = Number(i.monto) || 0;
  const modo = String(i.modo || 'agregar');
  const tasa = ECUADOR_2026.iva; // 0.15
  if (monto <= 0) throw new Error('Ingresá un monto');

  let base: number, iva: number, total: number;
  if (modo === 'quitar') {
    // El monto ingresado YA incluye IVA
    total = monto;
    base = monto / (1 + tasa);
    iva = total - base;
  } else {
    // El monto ingresado es la base sin IVA
    base = monto;
    iva = monto * tasa;
    total = base + iva;
  }

  const _insight = {
    title: modo === 'quitar' ? 'Desglose del precio con IVA' : 'Precio con IVA incluido',
    text: modo === 'quitar'
      ? `Un precio final de **${fmtUSDec(total)}** se compone de **${fmtUSDec(base)}** de base imponible más **${fmtUSDec(iva)}** de IVA (15%).`
      : `Sobre una base de **${fmtUSDec(base)}**, el IVA del 15% es **${fmtUSDec(iva)}** y el total a pagar es **${fmtUSDec(total)}**.`,
    tone: 'neutral',
    icon: '🧮',
  };
  const _chart = {
    type: 'donut',
    segments: [
      { label: 'Base imponible', value: Math.round(base * 100) / 100 },
      { label: 'IVA 15%', value: Math.round(iva * 100) / 100 },
    ],
    label: fmtUSDec(total),
    ariaLabel: `Total ${fmtUSDec(total)}: base ${fmtUSDec(base)} más IVA ${fmtUSDec(iva)}.`,
  };

  return {
    iva: fmtUSDec(iva),
    base: fmtUSDec(base),
    total: fmtUSDec(total),
    detalle: modo === 'quitar'
      ? `Total ${fmtUSDec(total)} ÷ 1,15 = base ${fmtUSDec(base)}; IVA ${fmtUSDec(iva)}.`
      : `Base ${fmtUSDec(base)} × 15% = IVA ${fmtUSDec(iva)}; total ${fmtUSDec(total)}.`,
    _insight,
    _chart,
  };
}
