/**
 * Dólar hoy República Dominicana — cotización del peso dominicano (USD ↔ DOP).
 * Conversor con precio de compra y venta del BCRD. Las tasas NO se hardcodean:
 * vienen del snapshot REPUBLICA_DOMINICANA_2026.fx (BCRD). Es la conversión
 * cambiaria más buscada del país (economía fuertemente dolarizada por remesas
 * y turismo).
 */
import { REPUBLICA_DOMINICANA_2026, fmtDOP } from '../data/republica-dominicana-2026';

export interface Inputs {
  monto?: number;
  direccion?: string; // 'usd-dop' (dólares → pesos) | 'dop-usd' (pesos → dólares)
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

function fmtUSD(n: number): string {
  return 'US$ ' + new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

export function dolarHoyRepublicaDominicana(i: Inputs): Outputs {
  const monto = Number(i.monto) || 0;
  const direccion = String(i.direccion || 'usd-dop') === 'dop-usd' ? 'dop-usd' : 'usd-dop';
  if (monto <= 0) throw new Error('Ingresá el monto a convertir');

  const fx = REPUBLICA_DOMINICANA_2026.fx;
  const compra = fx.usdCompra; // RD$ por USD a los que el banco TE COMPRA dólares
  const venta = fx.usdVenta;   // RD$ por USD a los que el banco TE VENDE dólares
  const mid = fx.usdMid;       // promedio de referencia

  let resultado: number;
  let resultadoFmt: string;
  let detalle: string;

  if (direccion === 'usd-dop') {
    // De dólares a pesos usamos la tasa media de referencia para el valor principal.
    resultado = monto * mid;
    resultadoFmt = fmtDOP(resultado);
    detalle = `${fmtUSD(monto)} × ${mid.toLocaleString('de-DE', { minimumFractionDigits: 2 })} = ${fmtDOP(resultado)} (tasa media de referencia).`;
  } else {
    resultado = monto / mid;
    resultadoFmt = fmtUSD(resultado);
    detalle = `${fmtDOP(monto)} ÷ ${mid.toLocaleString('de-DE', { minimumFractionDigits: 2 })} = ${fmtUSD(resultado)} (tasa media de referencia).`;
  }

  // Valor a la compra y a la venta del mismo monto (sólo informativo, en la dirección USD→DOP).
  const enCompra = monto * compra;
  const enVenta = monto * venta;

  const _table = {
    title: `Dólar hoy en pesos dominicanos (RD$ por USD, al ${fx.fecha})`,
    headers: ['Dólares (USD)', 'Compra (RD$)', 'Venta (RD$)'],
    rows: [
      ['US$ 1', fmtDOP(1 * compra), fmtDOP(1 * venta)],
      ['US$ 10', fmtDOP(10 * compra), fmtDOP(10 * venta)],
      ['US$ 50', fmtDOP(50 * compra), fmtDOP(50 * venta)],
      ['US$ 100', fmtDOP(100 * compra), fmtDOP(100 * venta)],
      ['US$ 500', fmtDOP(500 * compra), fmtDOP(500 * venta)],
      ['US$ 1.000', fmtDOP(1000 * compra), fmtDOP(1000 * venta)],
    ],
    note: `Cotización de referencia del BCRD al ${fx.fecha} (compra RD$ ${compra.toLocaleString('de-DE', { minimumFractionDigits: 2 })} / venta RD$ ${venta.toLocaleString('de-DE', { minimumFractionDigits: 2 })}). Cada banco y agente de cambio fija su propio precio con un spread que se aparta de esta referencia.`,
  };

  const _insight = {
    type: 'highlight',
    icon: '💵',
    text:
      direccion === 'usd-dop'
        ? `**${fmtUSD(monto)}** equivalen a **${fmtDOP(resultado)}** a la tasa media de referencia del BCRD (1 USD = RD$ ${mid.toLocaleString('de-DE', { minimumFractionDigits: 2 })}, al ${fx.fecha}). En el banco, a la **venta** recibirías ${fmtDOP(enVenta)} y a la **compra** ${fmtDOP(enCompra)}.`
        : `**${fmtDOP(monto)}** equivalen a **${fmtUSD(resultado)}** a la tasa media de referencia del BCRD (1 USD = RD$ ${mid.toLocaleString('de-DE', { minimumFractionDigits: 2 })}, al ${fx.fecha}). El precio real de compra/venta de tu banco se aparta por el spread.`,
  };

  return {
    resultado: resultadoFmt,
    cotizacion: `1 USD = ${fmtDOP(mid)} (compra ${fmtDOP(compra)} · venta ${fmtDOP(venta)})`,
    fecha: fx.fecha,
    detalle,
    _table,
    _insight,
  };
}
