/**
 * Alquiler asequible según ingreso — PERÚ 2026.
 * Regla del 30%: el alquiler recomendable no debería superar el 30% del ingreso neto mensual.
 * Compara el alquiler máximo recomendable con precios promedio de alquiler por distrito de Lima.
 *
 * Fuentes de datos 2026:
 *  - RMV S/ 1.130 (piso de ingreso): DS 006-2024-TR, vigente desde ene-2025, mantenida en 2026.
 *  - Precios de alquiler por distrito (Lima): Urbania Index, reporte abril 2026 (promedio Lima S/ 3.356/mes).
 *    https://www.infobae.com/peru/2026/05/21/barranco-y-san-isidro-tienen-los-precios-de-alquiler-mas-altos-de-lima-ambos-superan-los-s-4200-mensuales-en-promedio/
 *  - Distritos no incluidos en el reporte abril-2026 usan el Urbania Index oct-2025 (S/ 3.187/mes promedio).
 *    https://www.infobae.com/peru/2025/11/28/cuanto-cuesta-alquilar-en-distritos-de-lima-top-asi-cerraron-los-precios-en-octubre/
 */
import { PERU_2026, fmtPEN } from '../data/peru-2026.ts';

// Alquiler promedio mensual de un departamento por distrito de Lima (S/).
// fuente: Urbania Index abril-2026 (Barranco, San Isidro, Miraflores, La Victoria, Lince, La Molina, promedio Lima);
// resto: Urbania Index octubre-2025. Depto estándar ~3 dormitorios / ~100 m².
export const ALQUILER_DISTRITO_LIMA: Record<string, number> = {
  'Barranco': 4317,            // fuente: Urbania abr-2026
  'San Isidro': 4213,          // fuente: Urbania abr-2026
  'Miraflores': 3868,          // fuente: Urbania abr-2026
  'La Victoria': 3760,         // fuente: Urbania abr-2026
  'Surquillo': 3457,           // fuente: Urbania oct-2025
  'Jesús María': 3357,         // fuente: Urbania oct-2025
  'Promedio Lima': 3356,       // fuente: Urbania abr-2026
  'Magdalena del Mar': 3211,   // fuente: Urbania oct-2025
  'Cercado de Lima': 3073,     // fuente: Urbania oct-2025
  'Pueblo Libre': 2874,        // fuente: Urbania oct-2025
  'San Borja': 2829,           // fuente: Urbania oct-2025
  'San Miguel': 2807,          // fuente: Urbania oct-2025
  'Santiago de Surco': 2737,   // fuente: Urbania oct-2025
  'Lince': 2690,               // fuente: Urbania abr-2026
  'La Molina': 2583,           // fuente: Urbania abr-2026
  'Chorrillos': 2422,          // fuente: Urbania oct-2025
  'Los Olivos': 1535,          // fuente: Urbania oct-2025
};

// Regla del 30%: estándar internacional de asequibilidad de vivienda (rent-to-income ratio).
// 30% = límite recomendable; >30% se considera "rent-burdened". fuente: criterio HUD / práctica financiera estándar.
const RATIO_RECOMENDADO = 0.30;
const RATIO_TOLERABLE = 0.35;   // hasta 35% es "ajustado pero manejable"

export interface Inputs {
  ingresoNeto: number;            // ingreso neto mensual del hogar (S/)
  distrito?: string;              // distrito de Lima a comparar (clave de ALQUILER_DISTRITO_LIMA)
  alquilerActual?: number | string; // alquiler que pagás/te ofrecen hoy (opcional, S/)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

function toNum(v: number | string | undefined): number {
  if (v === '' || v === null || v === undefined) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function compute(i: Inputs): Outputs {
  const ingreso = toNum(i.ingresoNeto);
  if (ingreso <= 0) throw new Error('Ingresá tu ingreso neto mensual en soles');

  // Sanity: si el ingreso es menor a la RMV, igual calculamos pero lo señalamos.
  const bajoRMV = ingreso < PERU_2026.rmv;

  const alquilerMaximo = ingreso * RATIO_RECOMENDADO;     // 30% del ingreso neto
  const alquilerTolerable = ingreso * RATIO_TOLERABLE;    // 35% (techo ajustado)

  const distrito = String(i.distrito || 'Promedio Lima');
  const precioDistrito = ALQUILER_DISTRITO_LIMA[distrito] ?? ALQUILER_DISTRITO_LIMA['Promedio Lima'];

  // ¿Te alcanza para ese distrito con la regla del 30%?
  const ingresoNecesario30 = precioDistrito / RATIO_RECOMENDADO; // ingreso neto que necesitarías para que el promedio del distrito sea el 30%
  const ratioDistrito = precioDistrito / ingreso;                // % del ingreso que te comería el promedio del distrito

  let veredicto: string;
  let tone: 'good' | 'warn' | 'bad';
  if (precioDistrito <= alquilerMaximo) {
    veredicto = `Te alcanza cómodo: el alquiler promedio de ${distrito} (${fmtPEN(precioDistrito)}) está dentro de tu 30% recomendado.`;
    tone = 'good';
  } else if (precioDistrito <= alquilerTolerable) {
    veredicto = `Ajustado pero posible: el promedio de ${distrito} (${fmtPEN(precioDistrito)}) te llevaría ~${(ratioDistrito * 100).toFixed(0)}% del ingreso. Buscá en el rango bajo del distrito.`;
    tone = 'warn';
  } else {
    veredicto = `Caro para tu ingreso: el promedio de ${distrito} (${fmtPEN(precioDistrito)}) se comería el ${(ratioDistrito * 100).toFixed(0)}% de tu ingreso. Conviene mirar distritos más accesibles o compartir.`;
    tone = 'bad';
  }

  // Si el usuario ingresó su alquiler actual, evaluamos su carga real.
  const alquilerActual = toNum(i.alquilerActual);
  let evaluacionActual = '';
  if (alquilerActual > 0) {
    const ratioActual = alquilerActual / ingreso;
    if (ratioActual <= RATIO_RECOMENDADO) {
      evaluacionActual = `Tu alquiler actual (${fmtPEN(alquilerActual)}) es el ${(ratioActual * 100).toFixed(0)}% de tu ingreso: dentro de lo recomendado.`;
    } else if (ratioActual <= RATIO_TOLERABLE) {
      evaluacionActual = `Tu alquiler actual (${fmtPEN(alquilerActual)}) es el ${(ratioActual * 100).toFixed(0)}% de tu ingreso: ajustado, por encima del 30% ideal.`;
    } else {
      evaluacionActual = `Tu alquiler actual (${fmtPEN(alquilerActual)}) es el ${(ratioActual * 100).toFixed(0)}% de tu ingreso: alto (rent-burdened). Por encima del 35% suele apretar el resto del presupuesto.`;
    }
  }

  // Lo que te queda para el resto del presupuesto si gastás justo el 30%.
  const restoPresupuesto = ingreso - alquilerMaximo;

  const _insight = {
    title: 'Tu alquiler recomendable',
    text: `Con un ingreso neto de **${fmtPEN(ingreso)}**, tu alquiler máximo recomendable (regla del 30%) es **${fmtPEN(alquilerMaximo)}** al mes. ${veredicto}${evaluacionActual ? ' ' + evaluacionActual : ''}${bajoRMV ? ` Tu ingreso está por debajo de la RMV (${fmtPEN(PERU_2026.rmv)}); estirar el alquiler arriba del 30% es especialmente riesgoso.` : ''}`,
    tone,
    icon: '🔑',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Alquiler máximo (30%)', value: Math.round(alquilerMaximo) },
      { label: 'Resto del presupuesto (70%)', value: Math.round(restoPresupuesto) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(alquilerMaximo),
    centerLabel: 'Alquiler máx.',
    ariaLabel: `Con un ingreso neto de ${fmtPEN(ingreso)}, el alquiler máximo recomendable es ${fmtPEN(alquilerMaximo)} (30%) y queda ${fmtPEN(restoPresupuesto)} para el resto del presupuesto.`,
  };

  return {
    alquilerMaximo: fmtPEN(alquilerMaximo),
    alquilerTolerable: fmtPEN(alquilerTolerable),
    restoPresupuesto: fmtPEN(restoPresupuesto),
    precioDistrito: fmtPEN(precioDistrito),
    distrito,
    ratioDistrito: (ratioDistrito * 100).toFixed(0) + '%',
    ingresoNecesario: fmtPEN(ingresoNecesario30),
    veredicto,
    detalle: `Alquiler recomendable: ${fmtPEN(alquilerMaximo)} (30%) · tope ajustado: ${fmtPEN(alquilerTolerable)} (35%). Promedio ${distrito}: ${fmtPEN(precioDistrito)} → ${(ratioDistrito * 100).toFixed(0)}% de tu ingreso.${evaluacionActual ? ' ' + evaluacionActual : ''}`,
    _insight,
    _chart,
  };
}
