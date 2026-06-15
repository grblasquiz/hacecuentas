/**
 * Tarjeta de crédito Perú — la trampa del pago mínimo.
 * Simula cuánto tardás y cuánto interés pagás si abonás solo el pago mínimo,
 * y lo compara contra una cuota fija que vos elegís.
 *
 * Datos 2026:
 * - TEA promedio créditos de consumo ~58% (BCRP, feb-2026). El usuario puede ajustarla.
 *   fuente: BCRP, tasas activas promedio por modalidad, https://estadisticas.bcrp.gob.pe/estadisticas/series/mensuales/tasas-de-interes-activas-promedio-de-las-empresas-bancarias-por-modalidad
 * - Tope (tasa máxima compensatoria) consumo MN: 114,13% TEA (vigente may–oct 2026).
 *   fuente: BCRP, https://www.bcrp.gob.pe/sistema-financiero/tasas-maximas-de-interes-compensatorio.html
 * - Pago mínimo regulado por la SBS: capital revolvente mínimo = 1/36 del saldo
 *   revolvente + intereses + comisiones + cuotas del mes, con umbral mínimo S/ 30.
 *   fuente: SBS, Reglamento de Tarjetas de Crédito y Débito (Res. SBS N° 6523-2013 y mod.),
 *   https://www.gob.pe/sbs
 */
import { fmtPEN } from '../data/peru-2026.ts';

// Constantes regulatorias 2026 (Perú)
const TEA_TOPE_CONSUMO = 114.13; // % — tope BCRP consumo MN, may–oct 2026
const FRACCION_CAPITAL_MIN = 1 / 36; // capital revolvente mínimo = 1/36 del saldo (SBS)
const PISO_PAGO_MINIMO = 30; // S/ — umbral mínimo mensual del pago mínimo (SBS, MN)
const MESES_MAX = 600; // tope de iteración (50 años)

export interface Inputs {
  saldo: number;          // deuda revolvente actual en la tarjeta (S/)
  tea: number;            // tasa efectiva anual de la tarjeta (%)
  pagoFijo?: number;      // cuota fija mensual a comparar (S/), opcional
}

export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** Simula la amortización de una deuda revolvente.
 *  modo 'minimo' => paga el mínimo SBS (1/36 capital + interés, piso S/30).
 *  modo 'fijo'   => paga una cuota fija cada mes. */
function simular(
  saldoInicial: number,
  tasaMensual: number,
  modo: 'minimo' | 'fijo',
  pagoFijo: number,
): { meses: number; intereses: number; total: number; saldoFinal: number; primerPago: number } {
  let saldo = saldoInicial;
  let intereses = 0;
  let total = 0;
  let meses = 0;
  let primerPago = 0;

  while (saldo > 0.01 && meses < MESES_MAX) {
    meses++;
    const interesMes = saldo * tasaMensual;

    let pago: number;
    if (modo === 'minimo') {
      // Pago mínimo = capital revolvente mínimo (1/36 del saldo) + interés del mes.
      const capitalMin = saldo * FRACCION_CAPITAL_MIN;
      pago = capitalMin + interesMes;
      if (pago < PISO_PAGO_MINIMO) pago = Math.min(PISO_PAGO_MINIMO, saldo + interesMes);
    } else {
      pago = pagoFijo;
    }

    // No se puede pagar más que el saldo + interés del mes.
    if (pago > saldo + interesMes) pago = saldo + interesMes;

    if (meses === 1) primerPago = pago;

    intereses += interesMes;
    total += pago;
    saldo = saldo + interesMes - pago;

    // Si la cuota fija no cubre ni el interés, la deuda crece: trampa de deuda perpetua.
    if (modo === 'fijo' && pago <= interesMes) break;
  }

  return {
    meses,
    intereses,
    total,
    saldoFinal: Math.max(0, saldo),
    primerPago,
  };
}

export function compute(i: Inputs): Outputs {
  const saldo = Number(i.saldo) || 0;
  const tea = Number(i.tea) || 0;

  if (saldo <= 0) throw new Error('Ingresá el saldo de tu tarjeta (S/)');
  if (tea <= 0) throw new Error('Ingresá la tasa efectiva anual (TEA) de tu tarjeta, en %');
  if (tea > TEA_TOPE_CONSUMO + 0.5) {
    throw new Error(`La TEA no puede superar el tope legal de ${TEA_TOPE_CONSUMO}% (BCRP, consumo 2026). Revisá el dato.`);
  }

  // TEA -> tasa efectiva mensual: (1 + TEA)^(1/12) - 1
  const tasaMensual = Math.pow(1 + tea / 100, 1 / 12) - 1;

  // Escenario A: pago mínimo SBS.
  const min = simular(saldo, tasaMensual, 'minimo', 0);

  // Escenario B: cuota fija. Si el usuario no la define, proponemos una razonable
  // que liquide la deuda en ~12 meses (cuota de amortización francesa).
  let pagoFijo = Number(i.pagoFijo) || 0;
  let pagoFijoSugerido = false;
  if (pagoFijo <= 0) {
    const n = 12;
    pagoFijo = tasaMensual > 0
      ? (saldo * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -n))
      : saldo / n;
    pagoFijo = Math.ceil(pagoFijo);
    pagoFijoSugerido = true;
  }

  // Si la cuota fija no cubre ni el primer interés, avisamos (no liquida nunca).
  const interesPrimerMes = saldo * tasaMensual;
  const cuotaFijaInsuficiente = pagoFijo <= interesPrimerMes;

  const fijo = simular(saldo, tasaMensual, 'fijo', pagoFijo);

  const multiplicadorMin = min.total / saldo;
  const interesesEvitados = min.intereses - fijo.intereses;
  const aniosMin = Math.floor(min.meses / 12);
  const mesesRestoMin = min.meses % 12;
  const tiempoMinTxt = aniosMin > 0
    ? `${aniosMin} año${aniosMin > 1 ? 's' : ''}${mesesRestoMin > 0 ? ` y ${mesesRestoMin} mes${mesesRestoMin > 1 ? 'es' : ''}` : ''}`
    : `${min.meses} mes${min.meses > 1 ? 'es' : ''}`;

  const _insight = {
    title: 'Lo que te cuesta pagar solo el mínimo',
    text: cuotaFijaInsuficiente
      ? `Pagando **solo el mínimo** tu deuda de **${fmtPEN(saldo)}** tarda **${tiempoMinTxt}** (${min.meses} cuotas) y pagás **${fmtPEN(min.intereses)}** de intereses: terminás desembolsando **${fmtPEN(min.total)}**, o sea **${multiplicadorMin.toFixed(1)}× tu deuda original**. ⚠️ Ojo: la cuota fija que ingresaste (${fmtPEN(pagoFijo)}) **no alcanza ni para cubrir el interés mensual** (${fmtPEN(interesPrimerMes)}) — con esa cuota la deuda nunca se cancela. Subila.`
      : `Pagando **solo el mínimo** tu deuda de **${fmtPEN(saldo)}** tarda **${tiempoMinTxt}** (${min.meses} cuotas) y acumulás **${fmtPEN(min.intereses)}** de intereses: terminás pagando **${fmtPEN(min.total)}**, casi **${multiplicadorMin.toFixed(1)}× lo que debías**. Con una cuota fija de **${fmtPEN(pagoFijo)}**${pagoFijoSugerido ? ' (sugerida para cancelar en ~12 meses)' : ''} la liquidás en **${fijo.meses} mes${fijo.meses > 1 ? 'es' : ''}** y te ahorrás **${fmtPEN(interesesEvitados)}** en intereses.`,
    tone: multiplicadorMin > 1.6 ? 'bad' : 'warn',
    icon: '💳',
  };

  const _chart = {
    type: 'bar',
    bars: [
      { label: 'Deuda original', value: Math.round(saldo) },
      { label: 'Intereses (pago mínimo)', value: Math.round(min.intereses) },
      { label: 'Intereses (cuota fija)', value: Math.round(fijo.intereses) },
    ].filter((b) => b.value > 0),
    prefix: 'S/ ',
    ariaLabel: `Con pago mínimo pagás ${fmtPEN(min.intereses)} de intereses; con cuota fija de ${fmtPEN(pagoFijo)}, solo ${fmtPEN(fijo.intereses)}.`,
  };

  return {
    mesesMinimo: `${min.meses} meses (${tiempoMinTxt})`,
    interesesMinimo: fmtPEN(min.intereses),
    totalMinimo: fmtPEN(min.total),
    primerPagoMinimo: fmtPEN(min.primerPago),
    multiplicador: `${multiplicadorMin.toFixed(2)}× tu deuda`,
    cuotaFija: fmtPEN(pagoFijo) + (pagoFijoSugerido ? ' (sugerida)' : ''),
    mesesCuotaFija: cuotaFijaInsuficiente ? 'No liquida (cuota < interés)' : `${fijo.meses} meses`,
    interesesCuotaFija: cuotaFijaInsuficiente ? '—' : fmtPEN(fijo.intereses),
    interesesEvitados: cuotaFijaInsuficiente ? '—' : fmtPEN(interesesEvitados),
    detalle: `TEA ${tea}% → ${(tasaMensual * 100).toFixed(2)}% mensual · pago mínimo = 1/36 del saldo + interés (piso S/ 30, SBS) · tope legal consumo ${TEA_TOPE_CONSUMO}% TEA (BCRP).`,
    _insight,
    _chart,
  };
}
