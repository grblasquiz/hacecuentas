/**
 * Costo de vida Paraguay 2026 — calculadora basada en los gastos del usuario.
 *
 * No existe una "canasta básica" oficial publicada como monto único en Paraguay
 * (el INE difunde el IPC, no un costo de vida cerrado), así que NO se hardcodea
 * ninguna canasta: el cálculo parte del gasto mensual que ingresa el usuario.
 *
 *   salarios mínimos  = gastoMensual / SMVM (Gs. 3.044.000)
 *   gasto en USD      = gastoMensual / usdPyg (TC referencial BCP)
 *   % del ingreso     = gastoMensual / ingresoMensual × 100   (si se ingresa ingreso)
 *   ahorro potencial  = ingresoMensual − gastoMensual          (si se ingresa ingreso)
 *
 * Fuentes: MTESS (salario mínimo), BCP (tipo de cambio referencial).
 */
import { PARAGUAY_2026, TIPO_CAMBIO_PY, fmtPYG } from '../data/paraguay-2026';

export interface Inputs {
  gastoMensual: number;    // gasto mensual estimado (Gs.)
  ingresoMensual: number;  // ingreso mensual neto (Gs.) — opcional
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

function fmtUSD(n: number): string {
  return 'US$ ' + new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(n));
}

export function calculadoraCostoVidaParaguay(i: Inputs): Outputs {
  const gasto = Number(i.gastoMensual) || 0;
  const ingreso = Number(i.ingresoMensual) || 0;

  if (gasto <= 0) throw new Error('Ingresá tu gasto mensual estimado en guaraníes');

  const sm = PARAGUAY_2026.salarioMinimo; // 3.044.000
  const salariosMinimos = gasto / sm;
  const gastoUsd = gasto / TIPO_CAMBIO_PY.usdPyg;
  const gastoAnual = gasto * 12;

  const tieneIngreso = ingreso > 0;
  const pctIngreso = tieneIngreso ? (gasto / ingreso) * 100 : 0;
  const ahorro = tieneIngreso ? ingreso - gasto : 0;

  const _insight = tieneIngreso
    ? {
        type: 'highlight',
        icon: ahorro >= 0 ? '💰' : '⚠️',
        text: `Gastás **${fmtPYG(gasto)}** por mes (**${fmtUSD(gastoUsd)}**), equivalentes a **${salariosMinimos.toFixed(1)} salarios mínimos**. ` +
          (ahorro >= 0
            ? `Eso es el **${pctIngreso.toFixed(0)}%** de tu ingreso, así que te quedan **${fmtPYG(ahorro)}** de margen para ahorrar.`
            : `Eso supera tu ingreso: tu gasto es el **${pctIngreso.toFixed(0)}%** de lo que entra y te faltan **${fmtPYG(Math.abs(ahorro))}** por mes.`),
      }
    : {
        type: 'highlight',
        icon: '🇵🇾',
        text: `Un gasto de **${fmtPYG(gasto)}** mensuales equivale a **${salariosMinimos.toFixed(1)} salarios mínimos** ` +
          `(SMVM ${fmtPYG(sm)}) o **${fmtUSD(gastoUsd)}** al tipo de cambio del BCP. Al año son ${fmtPYG(gastoAnual)}.`,
      };

  const filas: Array<[string, string]> = [
    ['Gasto mensual', fmtPYG(gasto)],
    ['Gasto anual (×12)', fmtPYG(gastoAnual)],
    ['En dólares (BCP)', fmtUSD(gastoUsd)],
    ['Equivale a (salarios mínimos)', `${salariosMinimos.toFixed(1)} SMVM`],
  ];
  if (tieneIngreso) {
    filas.push(['% de tu ingreso', `${pctIngreso.toFixed(0)}%`]);
    filas.push([ahorro >= 0 ? 'Margen para ahorrar' : 'Déficit mensual', fmtPYG(Math.abs(ahorro))]);
  }

  const _table = {
    title: 'Tu costo de vida en distintas unidades',
    headers: ['Concepto', 'Monto'],
    rows: filas,
    note: `Conversión a USD con la cotización referencial del BCP (1 USD = ${fmtPYG(TIPO_CAMBIO_PY.usdPyg)}, al ${TIPO_CAMBIO_PY.asOf}). Paraguay no publica una canasta básica oficial como monto único, por eso el cálculo parte de tus gastos.`,
  };

  return {
    resumen: `${fmtPYG(gasto)}/mes · ${salariosMinimos.toFixed(1)} SMVM · ${fmtUSD(gastoUsd)}`,
    gastoMensual: Math.round(gasto),
    gastoUsd: Math.round(gastoUsd),
    salariosMinimos: Number(salariosMinimos.toFixed(2)),
    porcentajeIngreso: tieneIngreso ? Number(pctIngreso.toFixed(1)) : 0,
    margenMensual: tieneIngreso ? Math.round(ahorro) : 0,
    detalle: tieneIngreso
      ? `${fmtPYG(gasto)} = ${pctIngreso.toFixed(0)}% del ingreso · ${salariosMinimos.toFixed(1)} SMVM · ${fmtUSD(gastoUsd)}`
      : `${fmtPYG(gasto)} = ${salariosMinimos.toFixed(1)} SMVM · ${fmtUSD(gastoUsd)}`,
    _insight,
    _table,
  };
}
