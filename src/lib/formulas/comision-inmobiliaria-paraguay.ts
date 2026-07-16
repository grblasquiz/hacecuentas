/**
 * Comisión inmobiliaria — PARAGUAY.
 *
 * No hay una tarifa fijada por ley: la comisión surge del contrato de corretaje
 * (Código Civil / Ley 1034/83 del Comerciante) y se rige por la costumbre del
 * mercado. Referencias habituales:
 *
 *  - VENTA: alrededor del 5% del precio de la operación, más IVA. (Muchos avisos
 *    citan ~5%–5,5% "IVA incluido".)
 *  - ALQUILER: la gestión equivale a un mes de alquiler, que se reparte 50% el
 *    inquilino y 50% el propietario, más IVA sobre cada parte.
 *
 * La comisión es un servicio profesional gravado con IVA al 10% (distinto del 5%
 * que grava la venta del inmueble en sí). Moneda: guaraníes (PYG).
 */
import { PARAGUAY_2026, fmtPYG } from '../data/paraguay-2026.ts';

export interface Inputs {
  tipoOperacion?: string;   // 'venta' | 'alquiler'
  monto: number;            // precio de venta, o alquiler mensual, en Gs.
  comisionVentaPct?: number; // % de comisión para venta (default 5)
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; }

export function compute(i: Inputs): Outputs {
  const monto = Number(i.monto) || 0;
  if (monto <= 0) throw new Error('Ingresá el monto de la operación');
  const esAlquiler = String(i.tipoOperacion || 'venta') === 'alquiler';
  const iva = PARAGUAY_2026.iva.general; // 10%

  if (esAlquiler) {
    // Gestión = 1 mes de alquiler, repartido 50%/50%, + IVA sobre cada parte.
    const parte = monto * 0.5;
    const parteConIva = Math.round(parte * (1 + iva));
    const comisionTotal = Math.round(monto * (1 + iva));

    const _table = {
      title: 'Comisión por alquiler (1 mes, repartido)',
      headers: ['Concepto', 'Base', 'Con IVA 10%'],
      rows: [
        ['Comisión inquilino (50%)', fmtPYG(Math.round(parte)), fmtPYG(parteConIva)],
        ['Comisión propietario (50%)', fmtPYG(Math.round(parte)), fmtPYG(parteConIva)],
        ['Gestión total (1 mes)', fmtPYG(monto), fmtPYG(comisionTotal)],
      ],
      note: 'Costumbre del mercado paraguayo: la gestión de alquiler equivale a un mes, dividido en partes iguales entre inquilino y propietario, más IVA 10%. Es negociable.',
    };
    const _insight = {
      type: 'highlight',
      icon: '🔑',
      text: `Con un alquiler de **${fmtPYG(monto)}/mes**, la gestión inmobiliaria equivale a un mes: **${fmtPYG(parteConIva)}** los paga el inquilino y **${fmtPYG(parteConIva)}** el propietario (con IVA), total **${fmtPYG(comisionTotal)}**.`,
    };
    return {
      comisionTotal: fmtPYG(comisionTotal),
      comisionBase: fmtPYG(monto),
      iva: fmtPYG(Math.round(monto * iva)),
      reparto: `50% inquilino (${fmtPYG(parteConIva)}) + 50% propietario (${fmtPYG(parteConIva)})`,
      detalle: `Alquiler ${fmtPYG(monto)} = 1 mes de gestión + IVA 10% = ${fmtPYG(comisionTotal)}, repartido 50%/50%.`,
      _insight,
      _table,
    };
  }

  // Venta: % sobre el precio + IVA.
  let pct = Number(i.comisionVentaPct);
  if (!Number.isFinite(pct) || pct <= 0) pct = 5; // default 5%
  const base = monto * (pct / 100);
  const ivaMonto = Math.round(base * iva);
  const comisionTotal = Math.round(base + ivaMonto);

  const _table = {
    title: 'Comisión por venta',
    headers: ['Concepto', 'Cálculo', 'Monto'],
    rows: [
      [`Comisión base (${pct.toLocaleString('de-DE')}%)`, `${fmtPYG(monto)} × ${pct.toLocaleString('de-DE')}%`, fmtPYG(Math.round(base))],
      ['IVA (10%)', 'sobre la comisión', fmtPYG(ivaMonto)],
      ['Comisión total', '', fmtPYG(comisionTotal)],
    ],
    note: 'La comisión de venta ronda el 5% del precio (referencial, negociable), más IVA 10% por ser un servicio. Muchos avisos citan ~5%–5,5% con IVA incluido.',
  };
  const _insight = {
    type: 'highlight',
    icon: '🏘️',
    text: `Por vender un inmueble de **${fmtPYG(monto)}** con comisión del **${pct.toLocaleString('de-DE')}%**, la inmobiliaria cobra **${fmtPYG(Math.round(base))}** + IVA (${fmtPYG(ivaMonto)}) = **${fmtPYG(comisionTotal)}**.`,
  };
  return {
    comisionTotal: fmtPYG(comisionTotal),
    comisionBase: fmtPYG(Math.round(base)),
    iva: fmtPYG(ivaMonto),
    reparto: `Se define en el pacto (suele pagarla el vendedor, o repartirse).`,
    detalle: `${fmtPYG(monto)} × ${pct.toLocaleString('de-DE')}% = ${fmtPYG(Math.round(base))} + IVA ${fmtPYG(ivaMonto)} = ${fmtPYG(comisionTotal)}.`,
    _insight,
    _table,
  };
}
