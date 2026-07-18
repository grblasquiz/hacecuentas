/**
 * Retención de IRPF en la factura de un autónomo profesional (España).
 * Total a cobrar = base + IVA (21%) − retención IRPF. La retención (15% general,
 * 7% nuevos autónomos el año de alta + 2 siguientes, 1% módulos) es un adelanto del
 * IRPF que el cliente ingresa en Hacienda a tu nombre. Fórmula pura en euros (es-ES).
 */
import { RETENCION_AUTONOMO } from '../data/espana-2026.ts';

const fmtEur = (n: number): string =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100) + ' €';

export interface Inputs {
  baseImponible: number | string;   // honorarios sin IVA
  tipoRetencion?: string;           // '15' | '7' | '1'
  tipoIva?: string;                 // '21' | '10' | '4' | '0'
}

export interface Outputs { [k: string]: any; detalle: string; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const base = Number(i.baseImponible) || 0;
  const tipoRet = i.tipoRetencion !== undefined && i.tipoRetencion !== '' ? Number(i.tipoRetencion) : RETENCION_AUTONOMO.general;
  const tipoIva = i.tipoIva !== undefined && i.tipoIva !== '' ? Number(i.tipoIva) : RETENCION_AUTONOMO.ivaGeneral;

  if (base <= 0) throw new Error('Introduce la base imponible de la factura (honorarios sin IVA)');

  const iva = base * (tipoIva / 100);
  const retencion = base * (tipoRet / 100);
  const totalCobrar = base + iva - retencion;

  const etiquetaRet = tipoRet === RETENCION_AUTONOMO.nuevos
    ? '7% (nuevo autónomo)'
    : tipoRet === RETENCION_AUTONOMO.modulos
      ? '1% (módulos)'
      : '15% (general)';

  const _insight = {
    title: 'Lo que cobras y lo que adelantas',
    text: `Por una factura de **${fmtEur(base)}** (base) con IVA del ${tipoIva}% y retención del ${etiquetaRet}, tu cliente te ingresa **${fmtEur(totalCobrar)}**. La retención de **${fmtEur(retencion)}** no se pierde: es un adelanto de tu IRPF que Hacienda te descuenta en la declaración. El IVA de ${fmtEur(iva)} lo declaras tú en el modelo 303.`,
    tone: 'neutral',
    icon: '🧾',
  };

  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Base', value: Math.round(base * 100) / 100 },
      { label: 'IVA', value: Math.round(iva * 100) / 100 },
      { label: 'Retención', value: -Math.round(retencion * 100) / 100 },
      { label: 'A cobrar', value: Math.round(totalCobrar * 100) / 100 },
    ],
    ariaLabel: `Base ${fmtEur(base)}, IVA ${fmtEur(iva)}, retención ${fmtEur(retencion)}, total a cobrar ${fmtEur(totalCobrar)}.`,
  };

  return {
    totalCobrar: fmtEur(totalCobrar),
    retencionIRPF: fmtEur(retencion),
    ivaRepercutido: fmtEur(iva),
    detalle: `Base ${fmtEur(base)} + IVA ${tipoIva}% (${fmtEur(iva)}) − retención ${tipoRet}% (${fmtEur(retencion)}) = ${fmtEur(totalCobrar)} a cobrar.`,
    _insight,
    _chart,
  };
}
