/**
 * Retención de IVA (SENIAT) — Venezuela.
 *
 * Los sujetos pasivos especiales designados como agentes de retención retienen
 * un porcentaje del IVA facturado por sus proveedores (Providencia SNAT):
 *   - 75% del IVA en el caso general.
 *   - 100% del IVA en supuestos específicos (proveedor no inscrito en el RIF,
 *     factura que no cumple requisitos, monto de IVA no coincide, etc.).
 *
 *   iva            = baseImponible × alícuota
 *   retencion      = iva × (porcentaje / 100)
 *   ivaNoRetenido  = iva − retencion
 *   totalFactura   = baseImponible + iva
 *   aPagarProveedor= totalFactura − retencion   (lo que el agente le paga al proveedor)
 *
 * La alícuota de IVA (16% general / 8% reducida) sale del módulo
 * venezuela-2026.ts (NO se hardcodea).
 *
 * Fuente: SENIAT — Providencia Administrativa sobre retenciones de IVA de
 * sujetos pasivos especiales; Ley del IVA.
 */
import { VENEZUELA_2026, fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  baseImponible?: number;    // monto neto (sin IVA), Bs.
  alicuota?: string;         // 'general' (16%) | 'reducida' (8%)
  porcentajeRetencion?: string; // '75' | '100'
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

export function compute(i: Inputs): Outputs {
  const v = VENEZUELA_2026;
  const base = Math.max(0, Number(i.baseImponible) || 0);
  if (base <= 0) throw new Error('Ingresá la base imponible (monto neto sin IVA)');

  const alicuotaKey = String(i.alicuota ?? 'general') === 'reducida' ? 'reducida' : 'general';
  const alicuota = alicuotaKey === 'reducida' ? v.ivaReducida : v.iva; // 0.08 | 0.16
  const pct = String(i.porcentajeRetencion ?? '75') === '100' ? 100 : 75;

  const iva = base * alicuota;
  const retencion = iva * (pct / 100);
  const ivaNoRetenido = iva - retencion;
  const totalFactura = base + iva;
  const aPagarProveedor = totalFactura - retencion;

  const alicuotaPct = (alicuota * 100).toLocaleString('de-DE');

  const narrativa =
    `Sobre una base de ${fmtVES(base)}, el IVA al ${alicuotaPct}% es ${fmtVES(iva)}. ` +
    `Como agente de retención (sujeto pasivo especial) retenés el ${pct}% de ese IVA: ${fmtVES(retencion)}. ` +
    `Le pagás al proveedor ${fmtVES(aPagarProveedor)} (total factura ${fmtVES(totalFactura)} menos la retención) y enterás ${fmtVES(retencion)} al SENIAT con el comprobante de retención.`;

  return {
    retencionIva: Number(retencion.toFixed(2)),
    iva: Number(iva.toFixed(2)),
    ivaNoRetenido: Number(ivaNoRetenido.toFixed(2)),
    totalFactura: Number(totalFactura.toFixed(2)),
    aPagarProveedor: Number(aPagarProveedor.toFixed(2)),
    detalle: `Retención (${pct}%): ${fmtVES(retencion)} sobre un IVA de ${fmtVES(iva)} (${alicuotaPct}%)`,
    _insight: { type: 'highlight', icon: '🧾', text: narrativa },
    _table: {
      title: `Retención de IVA — ${pct}% (alícuota ${alicuotaPct}%)`,
      headers: ['Concepto', 'Monto (Bs.)'],
      rows: [
        ['Base imponible (neto)', fmtVES(base)],
        [`IVA (${alicuotaPct}%)`, fmtVES(iva)],
        ['Total de la factura', fmtVES(totalFactura)],
        [`IVA retenido (${pct}%)`, fmtVES(retencion)],
        ['IVA no retenido', fmtVES(ivaNoRetenido)],
        ['A pagar al proveedor', fmtVES(aPagarProveedor)],
      ],
      note: 'La retención general es del 75% del IVA; sube al 100% cuando el proveedor no está inscrito en el RIF, la factura no cumple requisitos formales o el IVA facturado no coincide con la alícuota. El agente entera la retención al SENIAT y emite el comprobante.',
    },
  };
}
