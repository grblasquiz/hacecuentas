/**
 * Tarjeta de crédito — la trampa del pago mínimo (República Dominicana).
 * Simula cuánto tardás y cuánto interés pagás si abonás sólo el pago mínimo, y
 * lo compara con una cuota fija. En RD las tasas de tarjeta rondan el 50%–60%
 * anual y NO hay tope legal de usura (las fija cada banco). El pago mínimo lo
 * define cada emisor; suele ser un % del balance (por defecto 5%), que muchas
 * veces no cubre ni el interés del mes. La tasa y el % de mínimo son editables.
 * Fuente: ProUsuario / Superintendencia de Bancos (Circular SB 005/11).
 */
import { fmtDOP } from '../data/republica-dominicana-2026';

const MESES_MAX = 600;

export interface Inputs {
  saldo: number;        // deuda actual de la tarjeta (RD$)
  tasa: number;         // tasa de interés anual (%)
  pctMinimo?: number;   // % del balance que es el pago mínimo (default 5)
  pagoFijo?: number;    // cuota fija a comparar (RD$), opcional
}

export interface Outputs { [k: string]: any; detalle: string; _insight?: any; _chart?: any; }

function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

function simular(
  saldoInicial: number,
  tasaMensual: number,
  modo: 'minimo' | 'fijo',
  pctMinimo: number,
  pagoFijo: number,
): { meses: number; intereses: number; total: number; primerPago: number } {
  let saldo = saldoInicial;
  let intereses = 0, total = 0, meses = 0, primerPago = 0;
  while (saldo > 0.01 && meses < MESES_MAX) {
    meses++;
    const interesMes = saldo * tasaMensual;
    let pago: number;
    if (modo === 'minimo') {
      pago = saldo * pctMinimo + interesMes; // % del capital + interés del mes
    } else {
      pago = pagoFijo;
    }
    if (pago > saldo + interesMes) pago = saldo + interesMes;
    if (meses === 1) primerPago = pago;
    intereses += interesMes;
    total += pago;
    saldo = saldo + interesMes - pago;
    if (modo === 'fijo' && pago <= interesMes) break; // no amortiza nunca
  }
  return { meses, intereses, total, primerPago };
}

export function compute(i: Inputs): Outputs {
  const saldo = num(i.saldo, 0);
  const tasa = num(i.tasa, 0);
  if (!(saldo > 0)) throw new Error('Ingresá el saldo de tu tarjeta en RD$');
  if (!(tasa > 0)) throw new Error('Ingresá la tasa de interés anual (%)');
  const pctMinimo = Math.max(0.01, num(i.pctMinimo, 5) / 100);

  const tasaMensual = Math.pow(1 + tasa / 100, 1 / 12) - 1;

  const min = simular(saldo, tasaMensual, 'minimo', pctMinimo, 0);

  let pagoFijo = num(i.pagoFijo, 0);
  let sugerido = false;
  if (!(pagoFijo > 0)) {
    const n = 12;
    pagoFijo = tasaMensual > 0
      ? (saldo * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -n))
      : saldo / n;
    pagoFijo = Math.ceil(pagoFijo);
    sugerido = true;
  }
  const interesPrimerMes = saldo * tasaMensual;
  const cuotaInsuficiente = pagoFijo <= interesPrimerMes;
  const fijo = simular(saldo, tasaMensual, 'fijo', pctMinimo, pagoFijo);

  const multiplicador = min.total / saldo;
  const interesesEvitados = min.intereses - fijo.intereses;
  const anios = Math.floor(min.meses / 12);
  const mesesResto = min.meses % 12;
  const tiempoTxt = anios > 0
    ? `${anios} año${anios > 1 ? 's' : ''}${mesesResto > 0 ? ` y ${mesesResto} mes${mesesResto > 1 ? 'es' : ''}` : ''}`
    : `${min.meses} mes${min.meses > 1 ? 'es' : ''}`;

  const _insight = {
    title: 'Lo que te cuesta pagar sólo el mínimo',
    text: cuotaInsuficiente
      ? `Pagando **sólo el mínimo** (${(pctMinimo * 100).toFixed(0)}% del balance + interés), tu deuda de **${fmtDOP(saldo)}** tarda **${tiempoTxt}** (${min.meses} pagos) y acumulás **${fmtDOP(min.intereses)}** de intereses: terminás pagando **${fmtDOP(min.total)}**, o sea **${multiplicador.toFixed(1)}× tu deuda**. ⚠️ La cuota fija que ingresaste (${fmtDOP(pagoFijo)}) no cubre ni el interés del mes (${fmtDOP(interesPrimerMes)}): con esa cuota la deuda no se cancela. Subila.`
      : `Pagando **sólo el mínimo** (${(pctMinimo * 100).toFixed(0)}% del balance + interés), tu deuda de **${fmtDOP(saldo)}** tarda **${tiempoTxt}** (${min.meses} pagos) y acumulás **${fmtDOP(min.intereses)}** de intereses: terminás pagando **${fmtDOP(min.total)}**, casi **${multiplicador.toFixed(1)}× lo que debías**. Con una cuota fija de **${fmtDOP(pagoFijo)}**${sugerido ? ' (sugerida para saldar en ~12 meses)' : ''} la liquidás en **${fijo.meses} mes${fijo.meses > 1 ? 'es' : ''}** y te ahorrás **${fmtDOP(interesesEvitados)}** en intereses.`,
    tone: multiplicador > 1.6 ? 'bad' as const : 'warn' as const,
    icon: '💳',
  };

  const _chart = {
    type: 'bar' as const,
    labels: ['Deuda original', 'Intereses (mínimo)', 'Intereses (cuota fija)'],
    values: [Math.round(saldo), Math.round(min.intereses), Math.round(fijo.intereses)],
    prefix: 'RD$ ',
    ariaLabel: `Con pago mínimo pagás ${fmtDOP(min.intereses)} de intereses; con cuota fija de ${fmtDOP(pagoFijo)}, ${fmtDOP(fijo.intereses)}.`,
  };

  return {
    mesesMinimo: `${min.meses} meses (${tiempoTxt})`,
    interesesMinimo: fmtDOP(min.intereses),
    totalMinimo: fmtDOP(min.total),
    multiplicador: `${multiplicador.toFixed(2)}× tu deuda`,
    cuotaFija: fmtDOP(pagoFijo) + (sugerido ? ' (sugerida)' : ''),
    mesesCuotaFija: cuotaInsuficiente ? 'No liquida (cuota < interés)' : `${fijo.meses} meses`,
    interesesEvitados: cuotaInsuficiente ? '—' : fmtDOP(interesesEvitados),
    detalle: `Tasa ${tasa}% anual → ${(tasaMensual * 100).toFixed(2)}% mensual · pago mínimo = ${(pctMinimo * 100).toFixed(0)}% del balance + interés del mes. En RD no hay tope legal de usura: la tasa la fija cada banco.`,
    _insight,
    _chart,
  };
}
