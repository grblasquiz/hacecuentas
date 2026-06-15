/**
 * Impuesto a la Renta de tercera categoría — Régimen General (Perú 2026).
 *
 * Dos cálculos:
 *  1) Impuesto anual = 29,5% sobre la renta neta imponible (utilidad tributaria).
 *     (Art. 55 de la Ley del Impuesto a la Renta — tasa vigente desde 2017.)
 *  2) Pago a cuenta mensual = mayor entre (coeficiente × ingresos del mes) y
 *     (1,5% × ingresos del mes). Si no hubo impuesto el año anterior, se aplica 1,5%.
 *     (Art. 85 de la Ley del IR + Cap. XI del Reglamento.)
 *
 * Fuentes:
 *  - SUNAT, Tasas para la determinación del Impuesto a la Renta anual (29,5%):
 *    https://orientacion.sunat.gob.pe/03-tasas-para-la-determinacion-del-impuesto-la-renta-anual
 *  - SUNAT, Determinación de pagos a cuenta (coeficiente vs 1,5%):
 *    https://orientacion.sunat.gob.pe/01-determinacion-de-pagos-cuenta
 */
import { PERU_2026, fmtPEN } from '../data/peru-2026.ts';

// Tasa del IR de tercera categoría, Régimen General — 29,5% (Art. 55 LIR, vigente 2017→).
// fuente: SUNAT, https://orientacion.sunat.gob.pe/03-tasas-para-la-determinacion-del-impuesto-la-renta-anual, 2026
const TASA_RG = 0.295;
// Coeficiente piso para el pago a cuenta cuando no hay/menor coeficiente — 1,5% (Art. 85 LIR).
// fuente: SUNAT, https://orientacion.sunat.gob.pe/01-determinacion-de-pagos-cuenta, 2026
const TASA_PAGO_CUENTA_MIN = 0.015;
// Tasa de dividendos (2da categoría) sobre la utilidad distribuida — 5% (Art. 52-A / 73-A LIR).
// fuente: SUNAT, https://orientacion.sunat.gob.pe/otras-rentas-de-segunda-categoria, 2026
const TASA_DIVIDENDOS = 0.05;

export interface Inputs {
  /** Renta neta imponible anual (utilidad tributaria sobre la que se aplica el 29,5%), en S/. */
  rentaNetaAnual: number;
  /** Ingresos netos del mes para estimar el pago a cuenta, en S/ (opcional). */
  ingresosMes?: number;
  /** Impuesto calculado del ejercicio anterior, en S/ (para el coeficiente; opcional). */
  impuestoAnioAnterior?: number;
  /** Ingresos netos totales del ejercicio anterior, en S/ (para el coeficiente; opcional). */
  ingresosAnioAnterior?: number;
}

export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

function num(v: unknown): number {
  if (v === '' || v === null || v === undefined) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function compute(i: Inputs): Outputs {
  const rentaNeta = num(i.rentaNetaAnual);
  const ingresosMes = num(i.ingresosMes);
  const impAnt = num(i.impuestoAnioAnterior);
  const ingAnt = num(i.ingresosAnioAnterior);

  if (rentaNeta <= 0 && ingresosMes <= 0) {
    throw new Error('Ingresá la renta neta anual y/o los ingresos del mes (en S/).');
  }

  // 1) Impuesto anual = 29,5% sobre la renta neta imponible.
  const impuestoAnual = Math.max(0, rentaNeta) * TASA_RG;
  const utilidadDespuesIR = Math.max(0, rentaNeta) - impuestoAnual;

  // 2) Pago a cuenta mensual: mayor(coeficiente, 1,5%) × ingresos del mes.
  // Coeficiente = impuesto del ejercicio anterior / ingresos netos del ejercicio anterior (redondeo 4 decimales).
  let coeficiente = 0;
  let usaCoeficiente = false;
  if (impAnt > 0 && ingAnt > 0) {
    coeficiente = Math.round((impAnt / ingAnt) * 10000) / 10000;
    usaCoeficiente = coeficiente > TASA_PAGO_CUENTA_MIN;
  }
  const tasaAplicada = usaCoeficiente ? coeficiente : TASA_PAGO_CUENTA_MIN;
  const pagoCuentaMes = ingresosMes > 0 ? ingresosMes * tasaAplicada : 0;

  // Dividendos: si la utilidad después del IR se distribuye a personas naturales, retención 5%.
  const dividendos5 = Math.max(0, utilidadDespuesIR) * TASA_DIVIDENDOS;
  // Carga combinada efectiva (empresa + socio) si se distribuye todo: IR + dividendos.
  const cargaCombinada = Math.max(0, rentaNeta) > 0
    ? (impuestoAnual + dividendos5) / Math.max(0, rentaNeta)
    : 0;

  const _insight = {
    title: 'Impuesto a la renta de tu empresa (Régimen General)',
    text: rentaNeta > 0
      ? `Sobre una renta neta imponible de **${fmtPEN(rentaNeta)}**, el Impuesto a la Renta anual es **${fmtPEN(impuestoAnual)}** (29,5%). Te queda una utilidad después de impuestos de **${fmtPEN(utilidadDespuesIR)}**. Si la distribuís como dividendos, se retiene 5% adicional (**${fmtPEN(dividendos5)}**), lo que lleva la carga combinada a **${(cargaCombinada * 100).toFixed(1)}%**.`
      : `Con ingresos del mes de **${fmtPEN(ingresosMes)}**, tu pago a cuenta mensual es **${fmtPEN(pagoCuentaMes)}** (tasa aplicada ${(tasaAplicada * 100).toFixed(2)}%). Estos pagos a cuenta son **anticipos** que se descuentan del impuesto anual del 29,5%.`,
    tone: rentaNeta > 0 ? 'neutral' : 'good',
    icon: '🏢',
  };

  const _chart = rentaNeta > 0
    ? {
        type: 'doughnut',
        slices: [
          { label: 'Utilidad después de IR', value: Math.round(utilidadDespuesIR) },
          { label: 'IR empresa (29,5%)', value: Math.round(impuestoAnual) },
        ].filter((s) => s.value > 0),
        prefix: 'S/ ',
        centerValue: fmtPEN(impuestoAnual),
        centerLabel: 'IR anual',
        ariaLabel: `Impuesto a la renta anual de ${fmtPEN(impuestoAnual)} (29,5%) sobre una renta neta de ${fmtPEN(rentaNeta)}.`,
      }
    : {
        type: 'bar',
        bars: [
          { label: 'Pago a cuenta (coeficiente)', value: Math.round(ingresosMes * coeficiente) },
          { label: 'Pago a cuenta (1,5%)', value: Math.round(ingresosMes * TASA_PAGO_CUENTA_MIN) },
        ],
        prefix: 'S/ ',
        ariaLabel: `Comparación del pago a cuenta mensual por coeficiente frente al 1,5% sobre ingresos de ${fmtPEN(ingresosMes)}.`,
      };

  const out: Outputs = {
    impuestoAnual: fmtPEN(impuestoAnual),
    utilidadDespuesIR: fmtPEN(utilidadDespuesIR),
    tasaEfectiva: rentaNeta > 0 ? (impuestoAnual / rentaNeta * 100).toFixed(1) + '%' : '—',
    pagoCuentaMes: ingresosMes > 0 ? fmtPEN(pagoCuentaMes) : '—',
    metodoPagoCuenta: ingresosMes > 0
      ? (usaCoeficiente
          ? `Coeficiente ${(coeficiente * 100).toFixed(2)}% (mayor que 1,5%)`
          : `1,5% (no hay coeficiente mayor del año anterior)`)
      : '—',
    dividendos5: rentaNeta > 0 ? fmtPEN(dividendos5) : '—',
    detalle: rentaNeta > 0
      ? `IR anual = 29,5% × ${fmtPEN(rentaNeta)} = ${fmtPEN(impuestoAnual)}. Pago a cuenta del mes = ${ingresosMes > 0 ? `${(tasaAplicada * 100).toFixed(2)}% × ${fmtPEN(ingresosMes)} = ${fmtPEN(pagoCuentaMes)}` : '—'}.`
      : `Pago a cuenta = ${(tasaAplicada * 100).toFixed(2)}% × ${fmtPEN(ingresosMes)} = ${fmtPEN(pagoCuentaMes)} (anticipo del IR anual).`,
    _insight,
    _chart,
  };
  return out;
}
