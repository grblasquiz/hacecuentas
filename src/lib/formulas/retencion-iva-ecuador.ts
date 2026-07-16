/**
 * Retención de IVA (Ecuador) — porcentaje del IVA que el agente de retención descuenta.
 * IVA general 15% (ECUADOR_2026.iva). Porcentajes de retención de IVA
 * (Resolución NAC-DGERCGC20-00000061, vigente 2026):
 *   30%  → adquisición de BIENES gravados (caso general)
 *   70%  → adquisición de SERVICIOS gravados (caso general)
 *   100% → honorarios profesionales, liquidaciones de compra, arriendo de inmuebles a
 *          persona natural no obligada a llevar contabilidad, pagos a exportadores
 *   10%  → BIENES entre contribuyentes especiales
 *   20%  → SERVICIOS entre contribuyentes especiales
 * Fuente: SRI (sri.gob.ec). Verificado 2026-07-16.
 */
import { ECUADOR_2026, fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  baseImponible: number;  // valor del bien/servicio sin IVA
  caso?: string;          // clave del caso de retención
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; }

const IVA = ECUADOR_2026.iva; // 0,15

interface Caso { label: string; pct: number; }
const CASOS: Record<string, Caso> = {
  bienes_general:          { label: 'Bienes gravados (caso general)', pct: 0.30 },
  servicios_general:       { label: 'Servicios gravados (caso general)', pct: 0.70 },
  honorarios_profesionales:{ label: 'Honorarios de servicios profesionales', pct: 1.00 },
  liquidacion_compra:      { label: 'Liquidación de compra de bienes/servicios', pct: 1.00 },
  arriendo_persona_natural:{ label: 'Arriendo de inmueble a persona natural no obligada a contabilidad', pct: 1.00 },
  bienes_especiales:       { label: 'Bienes entre contribuyentes especiales', pct: 0.10 },
  servicios_especiales:    { label: 'Servicios entre contribuyentes especiales', pct: 0.20 },
};

export function compute(i: Inputs): Outputs {
  const base = Number(i.baseImponible) || 0;
  const key = String(i.caso || 'servicios_general');
  const c = CASOS[key] || CASOS.servicios_general;
  if (base <= 0) throw new Error('Ingresá la base imponible (valor sin IVA)');

  const iva = base * IVA;
  const retencion = iva * c.pct;
  const ivaProveedor = iva - retencion;
  const totalFactura = base + iva;
  const valorAPagar = totalFactura - retencion;

  const _insight = {
    title: 'Retención de IVA y neto a pagar',
    text: `Sobre una base de **${fmtUSDec(base)}**, el IVA (15%) es **${fmtUSDec(iva)}**. En "${c.label}" se retiene el **${Math.round(c.pct * 100)}%** del IVA = **${fmtUSDec(retencion)}**. El comprador paga **${fmtUSDec(valorAPagar)}** al proveedor y entrega la retención al SRI.`,
    tone: 'neutral',
    icon: '🧾',
  };

  const _table = {
    title: `Retención de IVA sobre base ${fmtUSDec(base)}`,
    headers: ['Caso', '% de retención del IVA', 'Se retiene', 'IVA al proveedor'],
    align: ['left', 'right', 'right', 'right'] as ('left' | 'right' | 'center')[],
    rows: Object.values(CASOS).map((x) => [
      x.label,
      `${Math.round(x.pct * 100)}%`,
      fmtUSDec(iva * x.pct),
      fmtUSDec(iva - iva * x.pct),
    ]),
    note: 'Porcentajes de retención de IVA (Resolución NAC-DGERCGC20-00000061). El IVA de la factura siempre es el 15% de la base; lo que cambia es qué parte de ese IVA retiene el comprador.',
  };

  return {
    retencionIva: fmtUSDec(retencion),
    ivaFactura: fmtUSDec(iva),
    porcentajeAplicado: `${Math.round(c.pct * 100)}%`,
    valorAPagar: fmtUSDec(valorAPagar),
    detalle: `Base ${fmtUSDec(base)} · IVA ${fmtUSDec(iva)} · retención ${Math.round(c.pct * 100)}% = ${fmtUSDec(retencion)} · pago al proveedor ${fmtUSDec(valorAPagar)}.`,
    _insight,
    _table,
  };
}
