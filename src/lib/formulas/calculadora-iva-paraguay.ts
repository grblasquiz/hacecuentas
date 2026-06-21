/**
 * IVA Paraguay — Impuesto al Valor Agregado. Ley N° 6380/19.
 *
 * Tasa general 10% y tasa reducida 5%. El 5% aplica a: alquiler de inmuebles para
 * vivienda, venta de inmuebles, medicamentos de uso humano registrados ante el
 * MSPyBS y productos de la canasta familiar básica (art. 90, Ley 6380/19).
 *
 * Dos modos:
 *   agregar   → al neto se le suma el IVA:  iva = neto × t ; total = neto × (1 + t)
 *   desglosar → del precio final (con IVA) se extrae el IVA:
 *                neto = total / (1 + t) ; iva = total − neto
 *
 * Fuente: DNIT — IVA, Ley 6380/19.
 */
import { PARAGUAY_2026, fmtPYG } from '../data/paraguay-2026';

export interface Inputs {
  monto: number;    // monto base (neto si agregar, total con IVA si desglosar) en Gs.
  tasa: string;     // '10' | '5'
  modo: string;     // 'agregar' | 'desglosar'
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

export function calculadoraIvaParaguay(i: Inputs): Outputs {
  const monto = Number(i.monto) || 0;
  const tasaPct = Number(i.tasa) === 5 ? PARAGUAY_2026.iva.reducida : PARAGUAY_2026.iva.general;
  const desglosar = i.modo === 'desglosar';

  if (monto <= 0) throw new Error('Ingresá un monto en guaraníes');

  let neto: number;
  let iva: number;
  let total: number;

  if (desglosar) {
    // El monto YA incluye IVA → extraer el componente fiscal.
    total = monto;
    neto = monto / (1 + tasaPct);
    iva = total - neto;
  } else {
    // Agregar IVA sobre el neto.
    neto = monto;
    iva = monto * tasaPct;
    total = monto + iva;
  }

  const tasaLabel = `${(tasaPct * 100).toFixed(0)}%`;

  const _insight = {
    type: 'highlight',
    icon: '🧮',
    text: desglosar
      ? `De un precio final de **${fmtPYG(total)}** (IVA ${tasaLabel} incluido), el valor neto es **${fmtPYG(neto)}** ` +
        `y el IVA es **${fmtPYG(iva)}**.`
      : `Sobre un neto de **${fmtPYG(neto)}** el IVA ${tasaLabel} agrega **${fmtPYG(iva)}**, ` +
        `por lo que el precio final con IVA es **${fmtPYG(total)}**.`,
  };

  const _table = {
    title: `Desglose del IVA al ${tasaLabel}`,
    headers: ['Concepto', 'Monto'],
    rows: [
      ['Valor neto (sin IVA)', fmtPYG(neto)],
      [`IVA ${tasaLabel}`, fmtPYG(iva)],
      ['Total con IVA', fmtPYG(total)],
    ],
    note: tasaPct === PARAGUAY_2026.iva.reducida
      ? 'La tasa del 5% aplica a alquiler de vivienda, venta de inmuebles, medicamentos y canasta familiar básica (art. 90, Ley 6380/19).'
      : 'La tasa general del 10% aplica a la mayoría de bienes y servicios gravados.',
  };

  return {
    total: fmtPYG(total),
    totalMonto: Math.round(total),
    iva: Math.round(iva),
    neto: Math.round(neto),
    detalle: desglosar
      ? `Total ${fmtPYG(total)} = neto ${fmtPYG(neto)} + IVA ${tasaLabel} ${fmtPYG(iva)}`
      : `Neto ${fmtPYG(neto)} + IVA ${tasaLabel} ${fmtPYG(iva)} = ${fmtPYG(total)}`,
    _insight,
    _table,
  };
}
