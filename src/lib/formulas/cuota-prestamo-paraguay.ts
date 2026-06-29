/**
 * Calculadora de cuota de préstamo — PARAGUAY (sistema francés).
 *
 * Sistema de amortización francés (cuota fija): la cuota mensual se mantiene
 * constante durante todo el plazo. Cada cuota incluye una parte de interés
 * (decreciente) y una parte de capital (creciente).
 *
 *   i = (tasaAnual / 100) / 12                  (tasa mensual)
 *   cuota = monto · [ i·(1+i)^n ] / [ (1+i)^n − 1 ]
 *   totalPagar      = cuota · n
 *   interesesTotales = totalPagar − monto
 *
 * Si la tasa es 0% → cuota = monto / plazoMeses (sin intereses).
 * Moneda: guaraníes (PYG). El guaraní no usa decimales.
 */
import { fmtPYG } from '../data/paraguay-2026';

export interface CuotaPrestamoParaguayInputs {
  monto?: number | string;
  tasaAnual?: number | string;
  plazoMeses?: number | string;
}

export interface CuotaPrestamoParaguayOutputs {
  cuotaMensual: number;
  totalPagar: number;
  interesesTotales: number;
  resumen: string;
  formula: string;
  _insight?: any;
  _table?: any;
}

export function cuotaPrestamoParaguay(input: CuotaPrestamoParaguayInputs): CuotaPrestamoParaguayOutputs {
  const monto = Math.max(0, Number(input.monto) || 0);
  const tasaAnual = Math.max(0, Number(input.tasaAnual) || 0);
  let plazoMeses = Math.floor(Number(input.plazoMeses) || 0);

  if (monto <= 0) throw new Error('Ingresá el monto del préstamo');
  if (plazoMeses <= 0) throw new Error('Ingresá el plazo en meses');

  const i = (tasaAnual / 100) / 12; // tasa mensual

  let cuotaExacta: number;
  if (i === 0) {
    cuotaExacta = monto / plazoMeses;
  } else {
    const factor = Math.pow(1 + i, plazoMeses);
    cuotaExacta = (monto * (i * factor)) / (factor - 1);
  }

  const cuotaMensual = Math.round(cuotaExacta);
  const totalPagar = Math.round(cuotaExacta * plazoMeses);
  const interesesTotales = Math.round(totalPagar - monto);

  const resumen =
    `Préstamo de ${fmtPYG(monto)} a ${tasaAnual}% anual en ${plazoMeses} meses → ` +
    `cuota fija de ${fmtPYG(cuotaMensual)}. Pagás ${fmtPYG(interesesTotales)} de intereses.`;

  const formula =
    i === 0
      ? `Cuota = monto ÷ plazo = ${fmtPYG(monto)} ÷ ${plazoMeses} = ${fmtPYG(cuotaMensual)} (sin intereses)`
      : `Cuota = monto · [ i·(1+i)^n ] / [ (1+i)^n − 1 ], con i = ${(i * 100).toFixed(4)}% mensual y n = ${plazoMeses} → ${fmtPYG(cuotaMensual)}`;

  const _insight = {
    type: 'highlight' as const,
    icon: '🏦',
    text:
      `Sobre un préstamo de **${fmtPYG(monto)}** vas a pagar **${fmtPYG(totalPagar)}** en total: ` +
      `el capital más **${fmtPYG(interesesTotales)}** de intereses. ` +
      `La cuota es fija (${fmtPYG(cuotaMensual)}/mes), pero al principio la mayor parte de cada cuota es interés y recién después se acelera la amortización del capital.`,
  };

  // Tabla de amortización: primera, intermedia y última cuota (referencia).
  const filas: string[][] = [];
  let saldo = monto;
  const hitos = new Set<number>([1, Math.ceil(plazoMeses / 2), plazoMeses]);
  for (let mes = 1; mes <= plazoMeses; mes++) {
    const interesMes = saldo * i;
    const capitalMes = cuotaExacta - interesMes;
    saldo = saldo - capitalMes;
    if (hitos.has(mes)) {
      filas.push([
        String(mes),
        fmtPYG(interesMes),
        fmtPYG(capitalMes),
        fmtPYG(Math.max(0, saldo)),
      ]);
    }
  }

  const _table = {
    title: 'Composición de la cuota (sistema francés)',
    headers: ['Cuota Nº', 'Interés', 'Capital', 'Saldo restante'],
    rows: filas,
    note: 'En el sistema francés la cuota es fija, pero la parte de interés baja y la de capital sube con cada mes. Se muestran la primera cuota, una intermedia y la última.',
  };

  return {
    cuotaMensual,
    totalPagar,
    interesesTotales,
    resumen,
    formula,
    _insight,
    _table,
  };
}
