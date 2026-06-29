/**
 * Calculadora de plazo fijo (Certificado de Depósito de Ahorro, CDA) — PARAGUAY.
 *
 * Interés simple, base 365 días:
 *   interesBruto = capital · (tasaAnual/100) · (plazoDias/365)
 *   irpRetencion = aplicaIRP ? interesBruto · 0,08 : 0
 *   montoFinal   = capital + interesBruto − irpRetencion
 *   gananciaNeta = interesBruto − irpRetencion
 *
 * La retención del 8% corresponde al IRP sobre rentas del capital. Es OPCIONAL
 * y editable porque depende de la situación del depositante (no todos los
 * ahorristas están incididos por el IRP). Por defecto NO se aplica.
 * Moneda: guaraníes (PYG).
 */
import { fmtPYG } from '../data/paraguay-2026';

export interface PlazoFijoParaguayInputs {
  capital?: number | string;
  tasaAnual?: number | string;
  plazoDias?: number | string;
  aplicaIRP?: string; // 'si' | 'no'
}

export interface PlazoFijoParaguayOutputs {
  interesBruto: number;
  irpRetencion: number;
  montoFinal: number;
  gananciaNeta: number;
  resumen: string;
  formula: string;
  _insight?: any;
  _table?: any;
}

const TASA_IRP_CAPITAL = 0.08; // IRP rentas del capital (Ley 6380/19)

export function plazoFijoParaguay(input: PlazoFijoParaguayInputs): PlazoFijoParaguayOutputs {
  const capital = Math.max(0, Number(input.capital) || 0);
  const tasaAnual = Math.max(0, Number(input.tasaAnual) || 0);
  const plazoDias = Math.max(0, Number(input.plazoDias) || 0);
  const aplicaIRP = (input.aplicaIRP || 'no').toString() === 'si';

  if (capital <= 0) throw new Error('Ingresá el capital a depositar');
  if (plazoDias <= 0) throw new Error('Ingresá el plazo en días');

  const interesBrutoExacto = capital * (tasaAnual / 100) * (plazoDias / 365);
  const irpExacto = aplicaIRP ? interesBrutoExacto * TASA_IRP_CAPITAL : 0;
  const montoFinalExacto = capital + interesBrutoExacto - irpExacto;
  const gananciaNetaExacto = interesBrutoExacto - irpExacto;

  const interesBruto = Math.round(interesBrutoExacto);
  const irpRetencion = Math.round(irpExacto);
  const montoFinal = Math.round(montoFinalExacto);
  const gananciaNeta = Math.round(gananciaNetaExacto);

  const resumen =
    `${fmtPYG(capital)} al ${tasaAnual}% anual por ${plazoDias} días → ` +
    `interés bruto ${fmtPYG(interesBruto)}` +
    (aplicaIRP ? `, menos IRP 8% (${fmtPYG(irpRetencion)})` : '') +
    ` → cobrás ${fmtPYG(montoFinal)} al vencimiento.`;

  const formula =
    `Interés = capital · (tasa/100) · (días/365) = ${fmtPYG(capital)} · ${(tasaAnual / 100).toFixed(4)} · (${plazoDias}/365) = ${fmtPYG(interesBruto)}` +
    (aplicaIRP ? ` ; IRP 8% = ${fmtPYG(irpRetencion)}` : '');

  const _insight = {
    type: 'highlight' as const,
    icon: '💰',
    text:
      `Depositando **${fmtPYG(capital)}** a ${tasaAnual}% anual durante ${plazoDias} días, ganás **${fmtPYG(gananciaNeta)}** netos` +
      (aplicaIRP
        ? ` (ya descontado el IRP del 8% sobre los intereses, ${fmtPYG(irpRetencion)}).`
        : `. Si estás incidido por el IRP, marcá la opción para descontar el 8% sobre los intereses.`) +
      ` Al vencimiento retirás **${fmtPYG(montoFinal)}** en total.`,
  };

  const _table = {
    title: 'Detalle del plazo fijo',
    headers: ['Concepto', 'Monto'],
    rows: [
      ['Capital depositado', fmtPYG(capital)],
      ['Interés bruto', fmtPYG(interesBruto)],
      ['Retención IRP (8%)', aplicaIRP ? '− ' + fmtPYG(irpRetencion) : 'No aplica'],
      ['Ganancia neta', fmtPYG(gananciaNeta)],
      ['Monto final a cobrar', fmtPYG(montoFinal)],
    ],
    note: 'Interés simple sobre base de 365 días. La retención del IRP (8%) sobre las rentas del capital solo corresponde si el depositante está incidido por el impuesto; por eso es opcional.',
  };

  return {
    interesBruto,
    irpRetencion,
    montoFinal,
    gananciaNeta,
    resumen,
    formula,
    _insight,
    _table,
  };
}
