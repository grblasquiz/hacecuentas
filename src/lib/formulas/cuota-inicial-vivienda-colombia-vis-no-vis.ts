/**
 * Cuota inicial de vivienda en Colombia (VIS / VIP / No VIS).
 * Clasifica la vivienda por su valor contra los topes en SMLMV y calcula la cuota inicial
 * mínima según el crédito hipotecario máximo permitido (LTV):
 *   - VIS / VIP: el banco financia hasta el 80% del valor  → cuota inicial mínima 20%.
 *   - No VIS:    el banco financia hasta el 70% del valor  → cuota inicial mínima 30%.
 *
 * VERIFICADO: topes VIS 150 SMLMV / VIP 90 SMLMV (SMLMV importado del módulo, NO hardcodeado)
 * y LTV máximos 80% (VIS/VIP) y 70% (No VIS), norma estándar del crédito de vivienda en Colombia.
 * NOTA: 150 SMLMV es el tope VIS de grandes ciudades (Bogotá, Medellín, Cali, Barranquilla…);
 * el tope general municipal es 135 SMLMV y con planes de renovación urbana llega a 175 SMLMV.
 */
import { COLOMBIA_2026, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  valorVivienda: number;         // valor total de la vivienda (COP)
  porcentajeCuotaInicial?: number; // % de cuota inicial que el comprador planea aportar
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const valor = i.valorVivienda === undefined || i.valorVivienda === null || (i.valorVivienda as any) === ''
    ? NaN : Number(i.valorVivienda);
  if (!Number.isFinite(valor) || valor <= 0) {
    throw new Error('Ingresa el valor total de la vivienda que querés comprar');
  }

  const smlmv = COLOMBIA_2026.smlmv;          // importado del módulo — NO hardcodear
  const topeVIP = 90 * smlmv;                 // 90 SMLMV
  const topeVIS = 150 * smlmv;                // 150 SMLMV (grandes ciudades)

  let pct = i.porcentajeCuotaInicial === undefined || i.porcentajeCuotaInicial === null || (i.porcentajeCuotaInicial as any) === ''
    ? 30 : Number(i.porcentajeCuotaInicial);
  if (!Number.isFinite(pct)) pct = 30;
  pct = Math.min(100, Math.max(0, pct));      // guard: mantiene el % en [0,100]

  // ── Clasificación por valor ──
  let tipo: 'VIP' | 'VIS' | 'No VIS';
  let esVisOVip: boolean;
  if (valor <= topeVIP) { tipo = 'VIP'; esVisOVip = true; }
  else if (valor <= topeVIS) { tipo = 'VIS'; esVisOVip = true; }
  else { tipo = 'No VIS'; esVisOVip = false; }

  const minPct = esVisOVip ? 20 : 30;         // 80% LTV (VIS/VIP) vs 70% LTV (No VIS)
  const ltvMax = 100 - minPct;
  const cuotaInicialMinima = Math.round(valor * minPct / 100);
  const cuotaInicialElegida = Math.round(valor * pct / 100);
  const montoAFinanciar = Math.round(valor - cuotaInicialElegida);
  const financiableMax = Math.round(valor * ltvMax / 100);
  const insuficiente = pct < minPct;

  const topeTxt = tipo === 'VIP'
    ? `hasta 90 SMLMV (${fmtCOP(topeVIP)})`
    : tipo === 'VIS'
      ? `hasta 150 SMLMV (${fmtCOP(topeVIS)})`
      : `supera 150 SMLMV (${fmtCOP(topeVIS)})`;

  const detalle = insuficiente
    ? `Vivienda ${tipo} (${topeTxt}). El banco financia como máximo el ${ltvMax}% (${fmtCOP(financiableMax)}), así que la cuota inicial mínima es ${minPct}% = ${fmtCOP(cuotaInicialMinima)}. Tu ${pct}% (${fmtCOP(cuotaInicialElegida)}) queda por debajo del mínimo: subí la cuota inicial o no alcanzarás a cubrir la diferencia.`
    : `Vivienda ${tipo} (${topeTxt}). Con una cuota inicial del ${pct}% aportás ${fmtCOP(cuotaInicialElegida)} y financiás ${fmtCOP(montoAFinanciar)}. El mínimo exigible es ${minPct}% (${fmtCOP(cuotaInicialMinima)}), así que tu aporte cumple.`;

  const recomendacionMsg = insuficiente
    ? `Necesitás al menos ${fmtCOP(cuotaInicialMinima)} de cuota inicial (${minPct}%).`
    : `Tu cuota inicial cubre el mínimo del ${minPct}%.`;

  const _insight = {
    title: `Vivienda ${tipo}`,
    text: insuficiente
      ? `Tu vivienda es **${tipo}** (${topeTxt}). El crédito llega como máximo al **${ltvMax}%** del valor, por lo que la cuota inicial no puede bajar de **${minPct}%** = **${fmtCOP(cuotaInicialMinima)}**. Con el **${pct}%** que ingresaste (**${fmtCOP(cuotaInicialElegida)}**) te faltan **${fmtCOP(cuotaInicialMinima - cuotaInicialElegida)}**.`
      : `Tu vivienda es **${tipo}** (${topeTxt}). Con cuota inicial del **${pct}%** aportás **${fmtCOP(cuotaInicialElegida)}** y pedís crédito por **${fmtCOP(montoAFinanciar)}**. Cumplís el mínimo del **${minPct}%** (**${fmtCOP(cuotaInicialMinima)}**).`,
    tone: insuficiente ? 'warn' : 'good',
    icon: '🏠',
  };

  const _chart = {
    type: 'bar',
    labels: ['Cuota inicial', 'A financiar (crédito)'],
    values: [cuotaInicialElegida, Math.max(0, montoAFinanciar)],
    prefix: '$',
    ariaLabel: `Cuota inicial ${fmtCOP(cuotaInicialElegida)} y monto a financiar ${fmtCOP(montoAFinanciar)} sobre una vivienda de ${fmtCOP(valor)}.`,
  };

  return {
    clasificacion: `${tipo} · ${topeTxt}`,
    cuotaInicialMinima: `${fmtCOP(cuotaInicialMinima)} (${minPct}%)`,
    cuotaInicialElegida: `${fmtCOP(cuotaInicialElegida)} (${pct}%)`,
    montoAFinanciar: `${fmtCOP(montoAFinanciar)} (${100 - pct}% del valor)`,
    detalle: `${detalle} ${recomendacionMsg}`,
    _insight,
    _chart,
  };
}
