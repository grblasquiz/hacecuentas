/** IGV Perú — agregar o quitar el Impuesto General a las Ventas (18%) de un monto. */
import { PERU_2026, fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  monto: number;
  modo?: string;             // 'agregar' (monto = base, suma IGV) | 'quitar' (monto = total con IGV)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const monto = Number(i.monto) || 0;
  const modo = String(i.modo || 'agregar') === 'quitar' ? 'quitar' : 'agregar';
  const tasa = PERU_2026.igv; // 18%
  if (monto <= 0) throw new Error('Ingresá el monto');

  let base: number, igv: number, total: number;
  if (modo === 'agregar') {
    base = monto;
    igv = base * tasa;
    total = base + igv;
  } else {
    total = monto;
    base = total / (1 + tasa);
    igv = total - base;
  }

  const _insight = {
    title: modo === 'agregar' ? 'Monto con IGV incluido' : 'Monto sin IGV',
    text: modo === 'agregar'
      ? `Sobre una base de **${fmtPEN(base)}**, el IGV (18%) es **${fmtPEN(igv)}** y el total a pagar/facturar es **${fmtPEN(total)}**.`
      : `Un total de **${fmtPEN(total)}** con IGV incluido se descompone en una base de **${fmtPEN(base)}** y un IGV (18%) de **${fmtPEN(igv)}**.`,
    tone: 'good',
    icon: '🧾',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Base (sin IGV)', value: Math.round(base) },
      { label: 'IGV 18%', value: Math.round(igv) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(total),
    centerLabel: 'Total con IGV',
    ariaLabel: `Base ${fmtPEN(base)} más IGV ${fmtPEN(igv)} igual a ${fmtPEN(total)}.`,
  };

  return {
    base: fmtPEN(base),
    igv: fmtPEN(igv),
    total: fmtPEN(total),
    detalle: `Base ${fmtPEN(base)} + IGV 18% ${fmtPEN(igv)} = ${fmtPEN(total)}.`,
    _insight,
    _chart,
  };
}
