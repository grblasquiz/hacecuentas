/**
 * Euro a Guaraní (EUR ↔ PYG) — conversor con la cotización de referencia del BCP.
 *
 * El Banco Central del Paraguay (BCP) publica la cotización referencial de monedas
 * cada día hábil. El euro no se opera tan directamente como el dólar en Paraguay:
 * su valor en guaraníes surge del cruce EUR/USD × USD/PYG. Este conversor usa un
 * snapshot de referencia (misma fecha que el resto de las cotizaciones del módulo
 * país, TIPO_CAMBIO_PY.asOf) y debe refrescarse a diario contra el BCP.
 *
 * Moneda: guaraníes (PYG). 1 EUR = X guaraníes.
 */
import { fmtPYG, TIPO_CAMBIO_PY } from '../data/paraguay-2026.ts';

// EUR/PYG referencial — snapshot al 2026-06-19 (misma fecha que TIPO_CAMBIO_PY).
// Referencia BCP 24-jul-2026 (USD/PYG 6.050,25). Cambia a diario:
// para producción conviene servir el valor en vivo del BCP y dejar esto como fallback.
const EUR_PYG = 6884.58; // 1 EUR = Gs. 6.884,58 (referencia BCP, 24-jul-2026)

export interface Inputs {
  monto?: number;
  direccion?: string;   // 'eur-pyg' (euros → guaraníes) | 'pyg-eur' (guaraníes → euros)
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; }

function fmtEUR(n: number): string {
  return '€ ' + new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

export function compute(i: Inputs): Outputs {
  const monto = Number(i.monto) || 0;
  const direccion = String(i.direccion || 'eur-pyg') === 'pyg-eur' ? 'pyg-eur' : 'eur-pyg';
  if (monto <= 0) throw new Error('Ingresá el monto a convertir');

  const tc = EUR_PYG; // 1 EUR = X Gs.
  const tcFmt = tc.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  let resultado: number;
  let resultadoFmt: string;
  let detalle: string;
  if (direccion === 'eur-pyg') {
    resultado = monto * tc;
    resultadoFmt = fmtPYG(resultado);
    detalle = `${fmtEUR(monto)} × ${tcFmt} = ${fmtPYG(resultado)}.`;
  } else {
    resultado = monto / tc;
    resultadoFmt = fmtEUR(resultado);
    detalle = `${fmtPYG(monto)} ÷ ${tcFmt} = ${fmtEUR(resultado)}.`;
  }

  const _table = {
    title: `Euro a guaraní hoy (referencia BCP, 1 EUR = Gs. ${tcFmt})`,
    headers: ['Euros (EUR)', 'Guaraníes (PYG)'],
    rows: [
      ['€ 1', fmtPYG(1 * tc)],
      ['€ 10', fmtPYG(10 * tc)],
      ['€ 50', fmtPYG(50 * tc)],
      ['€ 100', fmtPYG(100 * tc)],
      ['€ 500', fmtPYG(500 * tc)],
      ['€ 1.000', fmtPYG(1000 * tc)],
    ],
    note: `Cotización referencial del BCP al ${TIPO_CAMBIO_PY.asOf}. Las casas de cambio y bancos manejan precios de compra y venta con un spread propio; el euro suele tener un spread mayor que el dólar en Paraguay.`,
  };

  const _insight = {
    type: 'highlight',
    icon: '🇪🇺',
    text: direccion === 'eur-pyg'
      ? `**${fmtEUR(monto)}** equivalen a **${fmtPYG(resultado)}** a la cotización de referencia del BCP (1 EUR = Gs. ${tcFmt}, al ${TIPO_CAMBIO_PY.asOf}). En la casa de cambio el valor real puede diferir por el spread.`
      : `**${fmtPYG(monto)}** equivalen a **${fmtEUR(resultado)}** a la cotización de referencia del BCP (1 EUR = Gs. ${tcFmt}, al ${TIPO_CAMBIO_PY.asOf}).`,
  };

  return {
    resultado: resultadoFmt,
    cotizacion: `1 EUR = ${fmtPYG(tc)}`,
    fecha: TIPO_CAMBIO_PY.asOf,
    detalle,
    _insight,
    _table,
  };
}
