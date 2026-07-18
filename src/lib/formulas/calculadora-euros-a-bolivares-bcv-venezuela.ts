/**
 * Convertir euros (EUR) a bolívares (Bs.) a la tasa BCV del euro, con IVA (16%)
 * e IGTF (3%) opcionales.
 *
 * El BCV publica una tasa oficial del EURO distinta a la del dólar. Como cambia
 * a diario, NO se hardcodea: la tasa del euro entra como input editable (mismo
 * patrón que la calc de dólares BCV). El IVA general (16%) y el IGTF (3% sobre
 * pagos en divisas en efectivo) se leen de src/lib/data/venezuela-2026.ts.
 *
 * Fórmula:
 *   base     = montoEUR × tasaEurBCV
 *   iva      = aplicaIVA ? base × 0,16 : 0
 *   subtotal = base + iva
 *   igtf     = pagaDivisas ? subtotal × 0,03 : 0
 *   totalBs  = subtotal + igtf
 *
 * Fuente: BCV (tasa oficial del euro), Ley del IVA (SENIAT), Ley del IGTF.
 */
import { VENEZUELA_2026, fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  montoEUR?: number;
  tasaEurBCV?: number;
  aplicaIVA?: string;   // "si" | "no"
  pagaDivisas?: string; // "si" | "no"
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

export function compute(i: Inputs): Outputs {
  const montoEUR = Math.max(0, Number(i.montoEUR) || 0);
  if (!montoEUR) throw new Error('Ingresá el monto en euros (EUR)');

  const tasaEurBCV = Math.max(0, Number(i.tasaEurBCV) || 0);
  if (!tasaEurBCV) throw new Error('Ingresá la tasa BCV del euro (Bs. por euro)');

  const aplicaIVA = String(i.aplicaIVA ?? 'no') === 'si';
  const pagaDivisas = String(i.pagaDivisas ?? 'no') === 'si';

  const tasaIVA = VENEZUELA_2026.iva;   // 0.16
  const tasaIGTF = VENEZUELA_2026.igtf; // 0.03

  const base = montoEUR * tasaEurBCV;
  const iva = aplicaIVA ? base * tasaIVA : 0;
  const subtotal = base + iva;
  const igtf = pagaDivisas ? subtotal * tasaIGTF : 0;
  const totalBs = subtotal + igtf;

  const eur = montoEUR.toLocaleString('de-DE', { maximumFractionDigits: 2 });
  const tasa = tasaEurBCV.toLocaleString('de-DE', { maximumFractionDigits: 2 });

  const narrativa =
    `€ ${eur} a la tasa BCV del euro de ${tasa} Bs./€ equivalen a ${fmtVES(base)}. ` +
    (aplicaIVA ? `Con IVA del 16% (${fmtVES(iva)}) ` : 'Sin IVA ') +
    (pagaDivisas ? `y con IGTF del 3% por pago en divisas (${fmtVES(igtf)}), ` : 'y sin IGTF, ') +
    `el total en bolívares es ${fmtVES(totalBs)}.`;

  return {
    totalBs: Number(totalBs.toFixed(2)),
    montoBs: Number(base.toFixed(2)),
    iva: Number(iva.toFixed(2)),
    igtf: Number(igtf.toFixed(2)),
    detalle: `€ ${eur} × ${tasa} = ${fmtVES(base)}${aplicaIVA ? ` + IVA ${fmtVES(iva)}` : ''}${pagaDivisas ? ` + IGTF ${fmtVES(igtf)}` : ''} = ${fmtVES(totalBs)}`,
    _insight: {
      type: 'highlight',
      icon: '💶',
      text: narrativa,
    },
    _table: {
      title: 'Desglose del monto en bolívares (tasa BCV del euro)',
      headers: ['Concepto', 'Monto (Bs.)'],
      rows: [
        ['Monto en bolívares (base)', fmtVES(base)],
        ['IVA (16%)', aplicaIVA ? fmtVES(iva) : 'No aplica'],
        ['Subtotal', fmtVES(subtotal)],
        ['IGTF (3% divisas)', pagaDivisas ? fmtVES(igtf) : 'No aplica'],
        ['Total en bolívares', fmtVES(totalBs)],
      ],
      note: 'El BCV publica una tasa oficial del euro distinta a la del dólar; cambia a diario, por eso la ingresás vos. El IVA general es del 16% y el IGTF del 3% aplica solo a pagos en divisas en efectivo no bancarizados.',
    },
  };
}
