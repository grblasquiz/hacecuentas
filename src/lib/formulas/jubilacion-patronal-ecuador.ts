/**
 * Jubilación patronal (Ecuador) 2026.
 * El trabajador que cumple 25 años o más con el mismo empleador tiene derecho a una
 * jubilación a cargo de ese empleador (independiente de la del IESS).
 * Fondo global = 5% de la remuneración anual promedio × años de servicio, menos lo que
 * el empleador ya haya depositado en un fondo. La pensión mensual resulta de dividir el
 * fondo por el coeficiente de edad de la tabla del Ministerio del Trabajo (MDT).
 * Fuente: Código del Trabajo art. 216; tabla de coeficientes del MDT (trabajo.gob.ec).
 *
 * NOTA: la pensión mínima (no menor a cierta fracción del SBU) y la tabla de coeficientes
 * por edad varían por norma/actualización del MDT. Por eso el coeficiente de edad es un
 * INPUT (se toma de la tabla oficial) y la pensión mínima se trata como referencial.
 */
import { ECUADOR_2026, fmtUSDec } from '../data/ecuador-2026.ts';

const TASA_ANUAL = 0.05; // 5% de la remuneración anual promedio por cada año de servicio

export interface Inputs {
  anios: number;
  remuPromedio: number;     // remuneración mensual promedio de los últimos 5 años (USD)
  coefEdad: number;         // coeficiente de la tabla del MDT según la edad del jubilado
  fondosDepositados?: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const anios = Number(i.anios) || 0;
  const remuPromedio = Number(i.remuPromedio) || 0;
  const coefEdad = Number(i.coefEdad) || 0;
  const fondosDepositados = Number(i.fondosDepositados) || 0;

  const remuAnual = remuPromedio * 12;
  const base = remuAnual * TASA_ANUAL * anios;
  const fondoGlobal = Math.max(0, base - fondosDepositados);
  const pensionMensual = coefEdad > 0 ? fondoGlobal / coefEdad : 0;

  // Referencia (no vinculante) de pensión mínima: la ley fija pisos en función del SBU.
  const pisoReferencial = ECUADOR_2026.sbu * 0.30; // referencial — verificá con el MDT

  const cumpleAnios = anios >= 25;

  const _insight = {
    title: cumpleAnios ? 'Tu jubilación patronal' : 'Aún no alcanzás los 25 años',
    text: cumpleAnios
      ? `Con **${anios} años** y una remuneración promedio de **${fmtUSDec(remuPromedio)}**, el fondo global de jubilación patronal es **${fmtUSDec(fondoGlobal)}** (5% anual × años, menos lo ya depositado). Con un coeficiente de edad de **${coefEdad}**, la pensión mensual estimada es **${fmtUSDec(pensionMensual)}**.`
      : `La jubilación patronal exige **25 años o más** con el mismo empleador. Llevás **${anios}**. El cálculo se muestra a título informativo: fondo global **${fmtUSDec(fondoGlobal)}**.`,
    tone: cumpleAnios ? 'neutral' : 'warn',
    icon: '👴',
  };

  const _chart = {
    type: 'donut',
    segments: [
      { label: 'Fondo neto a tu favor', value: Math.round(fondoGlobal * 100) / 100 },
      { label: 'Fondos ya depositados', value: Math.round(Math.min(fondosDepositados, base) * 100) / 100 },
    ],
    ariaLabel: `Fondo global ${fmtUSDec(fondoGlobal)} tras descontar ${fmtUSDec(fondosDepositados)} ya depositados.`,
  };

  return {
    fondoGlobal: fmtUSDec(fondoGlobal),
    pensionMensual: fmtUSDec(pensionMensual),
    detalle: `Remuneración anual promedio ${fmtUSDec(remuAnual)} × 5% × ${anios} años = ${fmtUSDec(base)}; menos ${fmtUSDec(fondosDepositados)} depositados = fondo ${fmtUSDec(fondoGlobal)}. Pensión = fondo ÷ coeficiente ${coefEdad} = ${fmtUSDec(pensionMensual)}/mes. Piso referencial sugerido ≈ ${fmtUSDec(pisoReferencial)} (verificá la pensión mínima vigente con el MDT).`,
    _insight,
    _chart,
  };
}
