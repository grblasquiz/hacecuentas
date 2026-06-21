/**
 * IDU Paraguay — Impuesto a los Dividendos y Utilidades (Ley 6380/19).
 * Residente: 8% — Beneficiario del exterior (no residente): 15%.
 * Las tasas vienen de PARAGUAY_2026 (idu / iduNoResidente); no se hardcodean.
 */
import { PARAGUAY_2026, fmtPYG } from '../data/paraguay-2026.ts';

export interface Inputs {
  dividendos?: number;   // monto bruto de dividendos/utilidades a distribuir (Gs.)
  residencia?: string;   // 'residente' | 'exterior'
}

export interface Outputs { [k: string]: any; _insight?: any; _table?: any; }

export function iduDividendosParaguay(i: Inputs): Outputs {
  const dividendos = Number(i.dividendos) || 0;
  const residencia = String(i.residencia || 'residente') === 'exterior' ? 'exterior' : 'residente';
  if (dividendos <= 0) throw new Error('Ingresá el monto de dividendos a distribuir');

  const tasa = residencia === 'exterior' ? PARAGUAY_2026.iduNoResidente : PARAGUAY_2026.idu; // 0.15 / 0.08
  const tasaPct = Math.round(tasa * 100);
  const idu = dividendos * tasa;
  const neto = dividendos - idu;

  // Comparación residente vs exterior (lo más compartible)
  const iduResidente = dividendos * PARAGUAY_2026.idu;
  const iduExterior = dividendos * PARAGUAY_2026.iduNoResidente;
  const _table = {
    title: 'IDU según el beneficiario',
    headers: ['Beneficiario', 'Tasa', 'IDU (Gs.)', 'Neto a cobrar (Gs.)'],
    rows: [
      ['Residente en Paraguay', `${Math.round(PARAGUAY_2026.idu * 100)}%`, fmtPYG(iduResidente), fmtPYG(dividendos - iduResidente)],
      ['Beneficiario del exterior', `${Math.round(PARAGUAY_2026.iduNoResidente * 100)}%`, fmtPYG(iduExterior), fmtPYG(dividendos - iduExterior)],
    ],
    note: 'El IDU es una retención definitiva: la empresa lo retiene al momento de poner los dividendos a disposición y lo ingresa a la DNIT.',
  };

  const _insight = {
    type: 'highlight',
    icon: '💸',
    text: `Sobre dividendos de **${fmtPYG(dividendos)}**, el IDU al ${tasaPct}% (${residencia === 'exterior' ? 'beneficiario del exterior' : 'socio residente'}) es de **${fmtPYG(idu)}**, y el accionista cobra **${fmtPYG(neto)}** netos.`,
  };

  return {
    idu: idu,
    neto: neto,
    tasa: `${tasaPct}%`,
    bruto: dividendos,
    detalle: `Dividendos ${fmtPYG(dividendos)} × ${tasaPct}% = IDU ${fmtPYG(idu)} → neto ${fmtPYG(neto)}.`,
    _table,
    _insight,
  };
}
