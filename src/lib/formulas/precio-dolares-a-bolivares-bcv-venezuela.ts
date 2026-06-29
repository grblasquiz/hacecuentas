/**
 * Convertir un precio de dólares (USD) a bolívares (Bs.) a la tasa BCV,
 * con IVA (16%) e IGTF (3%) opcionales.
 *
 * La tasa BCV es VOLÁTIL (cambia a diario), así que NO se hardcodea: entra
 * como input editable. El IVA general (16%) y el IGTF (3% sobre pagos en
 * divisas) se leen de src/lib/data/venezuela-2026.ts.
 *
 * Fórmula:
 *   base     = precioUSD × tasaBCV
 *   iva      = aplicaIVA ? base × 0,16 : 0
 *   subtotal = base + iva
 *   igtf     = pagaDivisas ? subtotal × 0,03 : 0
 *   totalBs  = subtotal + igtf
 *
 * Fuente: BCV (tasa oficial), Ley del IVA (SENIAT), Ley del IGTF.
 */
import { VENEZUELA_2026, fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  precioUSD?: number;
  tasaBCV?: number;
  aplicaIVA?: string;   // "si" | "no"
  pagaDivisas?: string; // "si" | "no"
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

export function precioDolaresABolivaresBcvVenezuela(i: Inputs): Outputs {
  const precioUSD = Math.max(0, Number(i.precioUSD) || 0);
  if (!precioUSD) throw new Error('Ingresá el precio en dólares (USD)');

  const tasaBCV = Math.max(0, Number(i.tasaBCV) || 0);
  if (!tasaBCV) throw new Error('Ingresá la tasa BCV (Bs. por dólar)');

  const aplicaIVA = String(i.aplicaIVA ?? 'no') === 'si';
  const pagaDivisas = String(i.pagaDivisas ?? 'no') === 'si';

  const tasaIVA = VENEZUELA_2026.iva;   // 0.16
  const tasaIGTF = VENEZUELA_2026.igtf; // 0.03

  const base = precioUSD * tasaBCV;
  const iva = aplicaIVA ? base * tasaIVA : 0;
  const subtotal = base + iva;
  const igtf = pagaDivisas ? subtotal * tasaIGTF : 0;
  const totalBs = subtotal + igtf;

  const narrativa =
    `US$ ${precioUSD.toLocaleString('de-DE', { maximumFractionDigits: 2 })} a la tasa BCV de ` +
    `${tasaBCV.toLocaleString('de-DE', { maximumFractionDigits: 2 })} Bs./USD equivalen a ${fmtVES(base)}. ` +
    (aplicaIVA ? `Con IVA del 16% (${fmtVES(iva)}) ` : 'Sin IVA ') +
    (pagaDivisas ? `y con IGTF del 3% por pago en divisas (${fmtVES(igtf)}), ` : 'y sin IGTF, ') +
    `el total a pagar es ${fmtVES(totalBs)}.`;

  return {
    totalBs: Number(totalBs.toFixed(2)),
    precioBs: Number(base.toFixed(2)),
    iva: Number(iva.toFixed(2)),
    igtf: Number(igtf.toFixed(2)),
    _insight: {
      type: 'highlight',
      icon: '💱',
      text: narrativa,
    },
    _table: {
      title: 'Desglose del precio en bolívares (tasa BCV)',
      headers: ['Concepto', 'Monto (Bs.)'],
      rows: [
        ['Precio en bolívares (base)', fmtVES(base)],
        ['IVA (16%)', aplicaIVA ? fmtVES(iva) : 'No aplica'],
        ['Subtotal', fmtVES(subtotal)],
        ['IGTF (3% divisas)', pagaDivisas ? fmtVES(igtf) : 'No aplica'],
        ['Total a pagar', fmtVES(totalBs)],
      ],
      note: 'El IVA general en Venezuela es del 16% (Ley del IVA, SENIAT). El IGTF del 3% aplica solo a pagos en divisas en efectivo no bancarizados (Ley del IGTF). La tasa BCV cambia a diario: usá la tasa oficial del día.',
    },
  };
}
