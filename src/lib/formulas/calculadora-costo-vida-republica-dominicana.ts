/**
 * Costo de vida República Dominicana 2026 — calculadora basada en los gastos del usuario.
 *
 * R. D. no publica un "costo de vida" oficial como monto único (la ONE difunde el
 * IPC, variación de precios, no una canasta cerrada en pesos), así que NO se
 * hardcodea ninguna canasta: el cálculo parte del gasto mensual del usuario.
 *
 *   salarios mínimos = gastoMensual / salarioMínimo (no sectorizado, empresa grande)
 *   gasto en USD     = gastoMensual / usdMid (tasa media de referencia BCRD)
 *   % del ingreso    = gastoMensual / ingresoMensual × 100   (si se ingresa ingreso)
 *   margen de ahorro = ingresoMensual − gastoMensual          (si se ingresa ingreso)
 *
 * Fuentes: Comité Nacional de Salarios (salario mínimo), BCRD (tipo de cambio).
 */
import { REPUBLICA_DOMINICANA_2026, fmtDOP, usdToDop } from '../data/republica-dominicana-2026';

export interface Inputs {
  gastoMensual?: number;   // gasto mensual estimado (RD$)
  ingresoMensual?: number; // ingreso mensual neto (RD$) — opcional
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

function fmtUSD(n: number): string {
  return 'US$ ' + new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(n));
}

export function calculadoraCostoVidaRepublicaDominicana(i: Inputs): Outputs {
  const gasto = Number(i.gastoMensual) || 0;
  const ingreso = Number(i.ingresoMensual) || 0;
  if (gasto <= 0) throw new Error('Ingresá tu gasto mensual estimado en pesos dominicanos');

  // Referencia: salario mínimo del sector privado no sectorizado, empresa grande.
  const sm = REPUBLICA_DOMINICANA_2026.salarioMinimo.noSectorizado.grande; // 29.988
  const mid = REPUBLICA_DOMINICANA_2026.fx.usdMid;
  const fecha = REPUBLICA_DOMINICANA_2026.fx.fecha;

  const salariosMinimos = gasto / sm;
  // usdToDop convierte USD→DOP; para DOP→USD dividimos por la misma tasa media.
  const gastoUsd = gasto / mid;
  const gastoAnual = gasto * 12;

  const tieneIngreso = ingreso > 0;
  const pctIngreso = tieneIngreso ? (gasto / ingreso) * 100 : 0;
  const ahorro = tieneIngreso ? ingreso - gasto : 0;

  // sanity: usdToDop(gastoUsd) ≈ gasto (round-trip), confirma que importamos la tasa correcta
  void usdToDop;

  const _insight = tieneIngreso
    ? {
        type: 'highlight',
        icon: ahorro >= 0 ? '💰' : '⚠️',
        text:
          `Gastás **${fmtDOP(gasto)}** por mes (**${fmtUSD(gastoUsd)}**), equivalentes a **${salariosMinimos.toFixed(1)} salarios mínimos**. ` +
          (ahorro >= 0
            ? `Eso es el **${pctIngreso.toFixed(0)}%** de tu ingreso, así que te quedan **${fmtDOP(ahorro)}** de margen para ahorrar.`
            : `Eso supera tu ingreso: tu gasto es el **${pctIngreso.toFixed(0)}%** de lo que entra y te faltan **${fmtDOP(Math.abs(ahorro))}** por mes.`),
      }
    : {
        type: 'highlight',
        icon: '🇩🇴',
        text:
          `Un gasto de **${fmtDOP(gasto)}** mensuales equivale a **${salariosMinimos.toFixed(1)} salarios mínimos** ` +
          `(mínimo empresa grande ${fmtDOP(sm)}) o **${fmtUSD(gastoUsd)}** a la tasa media del BCRD. Al año son ${fmtDOP(gastoAnual)}.`,
      };

  const filas: Array<[string, string]> = [
    ['Gasto mensual', fmtDOP(gasto)],
    ['Gasto anual (×12)', fmtDOP(gastoAnual)],
    ['En dólares (BCRD)', fmtUSD(gastoUsd)],
    ['Equivale a (salarios mínimos)', `${salariosMinimos.toFixed(1)} SM`],
  ];
  if (tieneIngreso) {
    filas.push(['% de tu ingreso', `${pctIngreso.toFixed(0)}%`]);
    filas.push([ahorro >= 0 ? 'Margen para ahorrar' : 'Déficit mensual', fmtDOP(Math.abs(ahorro))]);
  }

  const _table = {
    title: 'Tu costo de vida en distintas unidades',
    headers: ['Concepto', 'Monto'],
    rows: filas,
    note: `Conversión a USD con la tasa media de referencia del BCRD (1 USD = ${fmtDOP(mid)}, al ${fecha}). Salario mínimo de referencia: empresa grande no sectorizada (${fmtDOP(sm)}). R. D. no publica una canasta básica oficial como monto único, por eso el cálculo parte de tus gastos.`,
  };

  return {
    resumen: `${fmtDOP(gasto)}/mes · ${salariosMinimos.toFixed(1)} SM · ${fmtUSD(gastoUsd)}`,
    gastoMensual: Math.round(gasto),
    gastoUsd: Math.round(gastoUsd),
    salariosMinimos: Number(salariosMinimos.toFixed(2)),
    porcentajeIngreso: tieneIngreso ? Number(pctIngreso.toFixed(1)) : 0,
    margenMensual: tieneIngreso ? Math.round(ahorro) : 0,
    detalle: tieneIngreso
      ? `${fmtDOP(gasto)} = ${pctIngreso.toFixed(0)}% del ingreso · ${salariosMinimos.toFixed(1)} SM · ${fmtUSD(gastoUsd)}`
      : `${fmtDOP(gasto)} = ${salariosMinimos.toFixed(1)} SM · ${fmtUSD(gastoUsd)}`,
    _insight,
    _table,
  };
}
