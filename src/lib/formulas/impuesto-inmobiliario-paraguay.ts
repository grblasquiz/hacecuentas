/**
 * Impuesto Inmobiliario — PARAGUAY.
 *
 * Tasa general del 1% sobre el AVALÚO FISCAL (valor fiscal) del inmueble,
 * establecida por la Ley 125/91 (art. 60) y recaudada por las municipalidades.
 * Los valores fiscales urbanos y rurales se reajustan cada año por decreto del
 * Ejecutivo según la inflación (para 2026, +4,1% — Decreto que ajusta el valor
 * fiscal, BCP/IPC). Muchas municipalidades otorgan un descuento por pronto pago
 * (típicamente 10% por pago contado en el primer trimestre; en Asunción rige el
 * 10% por pago total anticipado).
 *
 * Este cálculo estima el impuesto anual = avalúo fiscal × 1%, y aplica el
 * descuento por pronto pago si corresponde. NO incluye las tasas especiales
 * municipales (recolección de residuos, alumbrado, etc.) ni los adicionales por
 * baldío o gran extensión, que se liquidan por separado según cada municipio.
 *
 * Fuente de la tasa: Ley 125/91, recaudación municipal. Moneda: guaraníes (PYG).
 */
import { fmtPYG } from '../data/paraguay-2026.ts';

// Tasa general del impuesto inmobiliario (Ley 125/91, art. 60).
const TASA_IMPUESTO_INMOBILIARIO = 0.01; // 1% sobre el avalúo fiscal
// Descuento por pronto pago / pago contado anticipado (referencial, típico municipal).
const DESCUENTO_PRONTO_PAGO = 0.10; // 10%

export interface Inputs {
  avaluoFiscal: number;   // valor fiscal (avalúo) del inmueble, en guaraníes
  prontoPago?: string;    // 'si' aplica el descuento por pago contado anticipado
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; }

export function compute(i: Inputs): Outputs {
  const avaluo = Number(i.avaluoFiscal) || 0;
  if (avaluo <= 0) throw new Error('Ingresá el avalúo fiscal (valor fiscal) del inmueble');
  const conProntoPago = String(i.prontoPago || 'no') === 'si';

  const impuestoAnual = Math.round(avaluo * TASA_IMPUESTO_INMOBILIARIO);
  const descuento = conProntoPago ? Math.round(impuestoAnual * DESCUENTO_PRONTO_PAGO) : 0;
  const totalPagar = impuestoAnual - descuento;

  const _table = {
    title: 'Impuesto inmobiliario según avalúo fiscal (tasa 1%)',
    headers: ['Avalúo fiscal', 'Impuesto (1%)', 'Con 10% pronto pago'],
    rows: [
      ['Gs. 50.000.000', fmtPYG(50000000 * 0.01), fmtPYG(50000000 * 0.01 * 0.9)],
      ['Gs. 100.000.000', fmtPYG(100000000 * 0.01), fmtPYG(100000000 * 0.01 * 0.9)],
      ['Gs. 250.000.000', fmtPYG(250000000 * 0.01), fmtPYG(250000000 * 0.01 * 0.9)],
      ['Gs. 500.000.000', fmtPYG(500000000 * 0.01), fmtPYG(500000000 * 0.01 * 0.9)],
      ['Gs. 1.000.000.000', fmtPYG(1000000000 * 0.01), fmtPYG(1000000000 * 0.01 * 0.9)],
    ],
    note: 'Tasa general 1% (Ley 125/91) sobre el avalúo fiscal. El descuento por pronto pago es referencial (10% en Asunción por pago contado); verificá el valor fiscal y el plazo con tu municipalidad.',
  };

  const _insight = {
    type: 'highlight',
    icon: '🏠',
    text: conProntoPago
      ? `Con un avalúo fiscal de **${fmtPYG(avaluo)}**, el impuesto inmobiliario anual es **${fmtPYG(impuestoAnual)}** (1%). Pagando contado con el **10% de descuento** ahorrás ${fmtPYG(descuento)} y abonás **${fmtPYG(totalPagar)}**.`
      : `Con un avalúo fiscal de **${fmtPYG(avaluo)}**, el impuesto inmobiliario anual es **${fmtPYG(impuestoAnual)}** (1% sobre el valor fiscal). Si tu municipalidad ofrece pronto pago, podrías ahorrar ~${fmtPYG(Math.round(impuestoAnual * DESCUENTO_PRONTO_PAGO))}.`,
  };

  return {
    impuestoAnual: fmtPYG(impuestoAnual),
    descuentoProntoPago: fmtPYG(descuento),
    totalPagar: fmtPYG(totalPagar),
    detalle: `Avalúo fiscal ${fmtPYG(avaluo)} × 1% = ${fmtPYG(impuestoAnual)}` +
      (conProntoPago ? ` − 10% pronto pago (${fmtPYG(descuento)}) = ${fmtPYG(totalPagar)}.` : `. Sin descuento por pronto pago.`),
    _insight,
    _table,
  };
}
