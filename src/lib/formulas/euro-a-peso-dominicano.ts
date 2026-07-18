/**
 * Euro a peso dominicano (EUR ↔ DOP) — conversor con tasa de referencia editable.
 * La tasa de referencia (mid/compra/venta) viene del snapshot EUR_DOP_2026; el
 * usuario puede sobrescribirla porque cambia a diario. Relevante por el turismo
 * europeo y las remesas desde España.
 */
import { EUR_DOP_2026, fmtDOP } from '../data/republica-dominicana-2026';

export interface Inputs {
  monto?: number;
  direccion?: string; // 'eur-dop' (euros → pesos) | 'dop-eur' (pesos → euros)
  tasa?: number;      // RD$ por 1 EUR (opcional, default EUR_DOP_2026.mid)
}

export interface Outputs { [k: string]: any; _insight?: any; _table?: any; }

function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

function fmtEUR(n: number): string {
  return '€ ' + new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

export function compute(i: Inputs): Outputs {
  const monto = num(i.monto, 0);
  if (!(monto > 0)) throw new Error('Ingresá el monto a convertir');
  const direccion = String(i.direccion || 'eur-dop') === 'dop-eur' ? 'dop-eur' : 'eur-dop';
  const tasa = Math.max(0.0001, num(i.tasa, EUR_DOP_2026.mid));

  let resultadoFmt: string;
  let resultado: number;
  let detalle: string;
  if (direccion === 'eur-dop') {
    resultado = monto * tasa;
    resultadoFmt = fmtDOP(resultado);
    detalle = `${fmtEUR(monto)} × ${tasa.toLocaleString('de-DE', { minimumFractionDigits: 2 })} = ${fmtDOP(resultado)}.`;
  } else {
    resultado = monto / tasa;
    resultadoFmt = fmtEUR(resultado);
    detalle = `${fmtDOP(monto)} ÷ ${tasa.toLocaleString('de-DE', { minimumFractionDigits: 2 })} = ${fmtEUR(resultado)}.`;
  }

  const usaDefault = !(num(i.tasa, NaN) > 0);
  const _table = {
    title: `Euro en pesos dominicanos (RD$ por EUR${usaDefault ? `, ref. al ${EUR_DOP_2026.fecha}` : ''})`,
    headers: ['Euros (EUR)', `Pesos (RD$ a ${tasa.toLocaleString('de-DE', { minimumFractionDigits: 2 })})`],
    rows: [
      ['€ 1', fmtDOP(1 * tasa)],
      ['€ 10', fmtDOP(10 * tasa)],
      ['€ 50', fmtDOP(50 * tasa)],
      ['€ 100', fmtDOP(100 * tasa)],
      ['€ 500', fmtDOP(500 * tasa)],
      ['€ 1.000', fmtDOP(1000 * tasa)],
    ],
    note: usaDefault
      ? `Tasa de referencia ${EUR_DOP_2026.mid.toLocaleString('de-DE', { minimumFractionDigits: 2 })} al ${EUR_DOP_2026.fecha} (compra ${EUR_DOP_2026.compra} / venta ${EUR_DOP_2026.venta}). Cambia a diario; cada banco y agente aplica su propio spread.`
      : `Cálculo a la tasa que ingresaste (${tasa.toLocaleString('de-DE', { minimumFractionDigits: 2 })} RD$/EUR). Verificá la tasa del día en tu banco o agente de cambio.`,
  };

  const _insight = {
    type: 'highlight',
    icon: '💶',
    text: direccion === 'eur-dop'
      ? `**${fmtEUR(monto)}** equivalen a **${fmtDOP(resultado)}** a ${tasa.toLocaleString('de-DE', { minimumFractionDigits: 2 })} RD$/EUR${usaDefault ? ` (referencia al ${EUR_DOP_2026.fecha})` : ''}. El precio real varía según el spread de tu banco o remesadora.`
      : `**${fmtDOP(monto)}** equivalen a **${fmtEUR(resultado)}** a ${tasa.toLocaleString('de-DE', { minimumFractionDigits: 2 })} RD$/EUR${usaDefault ? ` (referencia al ${EUR_DOP_2026.fecha})` : ''}. El precio real varía según el spread de tu banco o remesadora.`,
  };

  return {
    resultado: resultadoFmt,
    tasa: `1 EUR = ${fmtDOP(tasa)}`,
    fecha: usaDefault ? EUR_DOP_2026.fecha : 'tasa ingresada',
    detalle,
    _table,
    _insight,
  };
}
