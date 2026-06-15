/**
 * Régimen MYPE Tributario (RMT) — Perú 2026.
 * Calcula:
 *   1) Pago a cuenta mensual del Impuesto a la Renta (1% de ingresos netos del mes
 *      mientras los ingresos netos anuales no superen las 300 UIT; si las superan,
 *      1,5% o el coeficiente del ejercicio anterior, el que resulte mayor — art. 85 LIR).
 *   2) Impuesto a la Renta ANUAL de tercera categoría: 10% sobre las primeras 15 UIT
 *      de renta neta y 29,5% sobre el exceso (DL 1269).
 *
 * Fuentes 2026:
 *   - SUNAT — Régimen MYPE Tributario: https://emprender.sunat.gob.pe/ruc/regimenes-tributarios-mype/regimen-mype-tributario
 *   - DL 1269 (crea el RMT): https://www.sunat.gob.pe/legislacion/mypeIR/dl1269.pdf
 *   - UIT 2026 S/ 5.500: DS 301-2025-EF (ver src/lib/data/peru-2026.ts)
 */
import { PERU_2026, fmtPEN } from '../data/peru-2026.ts';

// Parámetros del RMT 2026 (no están en peru-2026.ts → hardcode con fuente).
// fuente: SUNAT, https://emprender.sunat.gob.pe/ruc/regimenes-tributarios-mype/regimen-mype-tributario , 2026
const RMT = {
  tasaPagoCuenta: 0.01,          // 1% de ingresos netos mensuales (hasta 300 UIT anuales)
  tasaPagoCuentaExceso: 0.015,   // 1,5% (o coeficiente, el mayor) si supera 300 UIT — art. 85 LIR
  topePagoCuentaUit: 300,        // 300 UIT = S/ 1.650.000 (umbral del 1%)
  tramoRentaUit: 15,             // 10% hasta 15 UIT de renta neta
  tasaRentaTramo1: 0.10,         // 10%
  tasaRentaTramo2: 0.295,        // 29,5% sobre el exceso de 15 UIT
  limiteIngresosUit: 1700,       // tope para permanecer en el RMT (1700 UIT = S/ 9.350.000)
};

export interface Inputs {
  ingresosMensuales: number;     // ingresos netos del mes (S/), base del pago a cuenta
  ingresosAnuales?: number;      // ingresos netos acumulados del año (S/); si vacío, se proyecta = mensual × 12
  utilidadAnual?: number;        // renta neta imponible anual (S/), base del impuesto a la renta anual
  coeficiente?: number;          // coeficiente del ejercicio anterior (decimal, ej. 0.012) — opcional
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const ingresosMensuales = Number(i.ingresosMensuales) || 0;
  if (ingresosMensuales <= 0) throw new Error('Ingresá los ingresos netos del mes (S/)');

  const uit = PERU_2026.uit; // 5.500
  const tope300Uit = RMT.topePagoCuentaUit * uit;     // 1.650.000
  const limite1700Uit = RMT.limiteIngresosUit * uit;  // 9.350.000

  // Ingresos anuales: usar el dato si vino; si no, proyectar el mensual × 12.
  const ingAnualesRaw = i.ingresosAnuales === undefined || i.ingresosAnuales === null || String(i.ingresosAnuales) === ''
    ? null
    : Number(i.ingresosAnuales);
  const ingresosAnuales = ingAnualesRaw && ingAnualesRaw > 0 ? ingAnualesRaw : ingresosMensuales * 12;

  // ¿Excede el RMT? (informativo, no bloquea el cálculo)
  const excedeRmt = ingresosAnuales > limite1700Uit;

  // ----- 1) Pago a cuenta mensual -----
  const superaTope300 = ingresosAnuales > tope300Uit;
  const coef = i.coeficiente === undefined || i.coeficiente === null || String(i.coeficiente) === ''
    ? 0
    : Number(i.coeficiente);

  let tasaAplicada: number;
  let regimenPago: string;
  if (!superaTope300) {
    tasaAplicada = RMT.tasaPagoCuenta;            // 1%
    regimenPago = '1% (ingresos netos anuales ≤ 300 UIT)';
  } else {
    // 1,5% o el coeficiente del ejercicio anterior, el que resulte MAYOR (art. 85 LIR).
    tasaAplicada = Math.max(RMT.tasaPagoCuentaExceso, coef);
    regimenPago = coef > RMT.tasaPagoCuentaExceso
      ? `coeficiente ${(coef * 100).toFixed(2)}% (mayor que 1,5%, supera 300 UIT)`
      : '1,5% (supera 300 UIT)';
  }
  const pagoCuentaMensual = ingresosMensuales * tasaAplicada;

  // ----- 2) Impuesto a la renta ANUAL (sobre la utilidad / renta neta) -----
  const utilidadRaw = i.utilidadAnual === undefined || i.utilidadAnual === null || String(i.utilidadAnual) === ''
    ? null
    : Number(i.utilidadAnual);
  const utilidad = utilidadRaw && utilidadRaw > 0 ? utilidadRaw : 0;

  const tramo1 = RMT.tramoRentaUit * uit; // 82.500
  let impuestoAnual = 0;
  let impTramo1 = 0;
  let impTramo2 = 0;
  if (utilidad > 0) {
    const baseTramo1 = Math.min(utilidad, tramo1);
    impTramo1 = baseTramo1 * RMT.tasaRentaTramo1;           // 10%
    const exceso = Math.max(0, utilidad - tramo1);
    impTramo2 = exceso * RMT.tasaRentaTramo2;               // 29,5%
    impuestoAnual = impTramo1 + impTramo2;
  }

  // Tasa efectiva anual sobre la utilidad.
  const tasaEfectiva = utilidad > 0 ? (impuestoAnual / utilidad) * 100 : 0;

  // Regularización: impuesto anual menos los pagos a cuenta hechos en el año (estimación
  // simple = 12 × pago a cuenta del mes; sólo informativa cuando hay utilidad cargada).
  const pagosCuentaAnualEstimado = pagoCuentaMensual * 12;
  const saldoRegularizacion = utilidad > 0 ? impuestoAnual - pagosCuentaAnualEstimado : 0;

  // ----- Insight -----
  let insightText: string;
  let tone: string;
  let icon: string;
  if (excedeRmt) {
    insightText = `Con ingresos anuales de **${fmtPEN(ingresosAnuales)}** superás el tope de **1.700 UIT (${fmtPEN(limite1700Uit)})** del RMT: deberías pasar al **Régimen General**. Mientras tanto, tu pago a cuenta del mes sería **${fmtPEN(pagoCuentaMensual)}**.`;
    tone = 'warn';
    icon = '⚠️';
  } else if (utilidad > 0) {
    insightText = `Tu pago a cuenta de este mes es **${fmtPEN(pagoCuentaMensual)}** (${regimenPago}). Por el año, con una utilidad de **${fmtPEN(utilidad)}**, el Impuesto a la Renta anual es **${fmtPEN(impuestoAnual)}** (tasa efectiva ${tasaEfectiva.toFixed(1)}%): 10% sobre las primeras 15 UIT y 29,5% sobre el exceso.`;
    tone = 'good';
    icon = '🏪';
  } else {
    insightText = `Tu pago a cuenta de este mes es **${fmtPEN(pagoCuentaMensual)}** (${regimenPago}). Cargá tu **utilidad anual** para estimar también el Impuesto a la Renta de cierre (10% hasta 15 UIT, 29,5% el exceso).`;
    tone = 'good';
    icon = '🏪';
  }

  const _insight = {
    title: excedeRmt ? 'Superás el tope del RMT' : 'Pago a cuenta del RMT',
    text: insightText,
    tone,
    icon,
  };

  // ----- Chart -----
  let _chart: any;
  if (utilidad > 0) {
    _chart = {
      type: 'doughnut',
      slices: [
        { label: 'Utilidad después de impuesto', value: Math.round(utilidad - impuestoAnual) },
        { label: 'IR 10% (hasta 15 UIT)', value: Math.round(impTramo1) },
        { label: 'IR 29,5% (exceso)', value: Math.round(impTramo2) },
      ].filter((s) => s.value > 0),
      prefix: 'S/ ',
      centerValue: fmtPEN(impuestoAnual),
      centerLabel: 'IR anual',
      ariaLabel: `Impuesto a la Renta anual del RMT de ${fmtPEN(impuestoAnual)} sobre una utilidad de ${fmtPEN(utilidad)}.`,
    };
  } else {
    _chart = {
      type: 'doughnut',
      slices: [
        { label: 'Ingresos del mes', value: Math.round(ingresosMensuales - pagoCuentaMensual) },
        { label: 'Pago a cuenta', value: Math.round(pagoCuentaMensual) },
      ].filter((s) => s.value > 0),
      prefix: 'S/ ',
      centerValue: fmtPEN(pagoCuentaMensual),
      centerLabel: 'Pago a cuenta',
      ariaLabel: `Pago a cuenta mensual del RMT de ${fmtPEN(pagoCuentaMensual)} sobre ingresos de ${fmtPEN(ingresosMensuales)}.`,
    };
  }

  return {
    pagoCuentaMensual: fmtPEN(pagoCuentaMensual),
    tasaPagoCuenta: superaTope300 ? `${(tasaAplicada * 100).toFixed(2)}%` : '1%',
    impuestoRentaAnual: utilidad > 0 ? fmtPEN(impuestoAnual) : '—',
    tasaEfectivaAnual: utilidad > 0 ? `${tasaEfectiva.toFixed(1)}%` : '—',
    saldoRegularizacion: utilidad > 0 ? fmtPEN(saldoRegularizacion) : '—',
    detalle: utilidad > 0
      ? `Pago a cuenta: ${(tasaAplicada * 100).toFixed(2)}% de ${fmtPEN(ingresosMensuales)} = ${fmtPEN(pagoCuentaMensual)}/mes · IR anual: ${fmtPEN(impTramo1)} (10% s/ ${fmtPEN(Math.min(utilidad, tramo1))}) + ${fmtPEN(impTramo2)} (29,5% s/ exceso) = ${fmtPEN(impuestoAnual)}.`
      : `Pago a cuenta: ${(tasaAplicada * 100).toFixed(2)}% de ${fmtPEN(ingresosMensuales)} = ${fmtPEN(pagoCuentaMensual)}/mes. ${regimenPago}.`,
    _insight,
    _chart,
  };
}
