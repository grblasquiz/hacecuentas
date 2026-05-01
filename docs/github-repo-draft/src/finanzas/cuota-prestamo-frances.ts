/**
 * Cuota de préstamo — Sistema francés (cuota fija) y alemán (capital fijo)
 *
 * Fórmula estándar matemática-financiera, usada por bancos AR.
 *
 * Sistema FRANCÉS (más común):
 *   Cuota constante. Capital sube progresivamente, interés baja.
 *   Cuota = P × i × (1+i)^n / ((1+i)^n - 1)
 *
 * Sistema ALEMÁN:
 *   Capital constante. Cuota baja con el tiempo.
 *   Cuota_k = P/n + saldo_k × i
 *
 * Live calculator: https://hacecuentas.com/calculadora-cuota-prestamo
 */

export interface CuotaPrestamoInput {
  /** Capital prestado, en pesos. */
  capital: number;
  /** Tasa Nominal Anual (TNA) en decimal (ej: 0.65 para 65%). */
  tna: number;
  /** Cantidad de cuotas (mensuales). */
  cuotas: number;
  /** Sistema. Default: 'frances'. */
  sistema?: 'frances' | 'aleman';
}

export interface CuotaPrestamoResult {
  /** Cuota mensual (constante en francés, primera en alemán). */
  cuotaMensual: number;
  /** Total a pagar al final del préstamo. */
  totalAPagar: number;
  /** Total intereses pagados. */
  totalIntereses: number;
  /** TEA (tasa efectiva anual). */
  tea: number;
  /** Tabla de amortización detallada. */
  tabla: Array<{
    cuotaNum: number;
    cuota: number;
    interes: number;
    amortizacion: number;
    saldoRestante: number;
  }>;
  formula: string;
  sistema: 'frances' | 'aleman';
}

/**
 * Calcula la cuota de un préstamo + tabla de amortización completa.
 *
 * @example
 * ```ts
 * cuotaPrestamo({ capital: 1000000, tna: 0.85, cuotas: 24 });
 * // { cuotaMensual: ~104500, totalAPagar: ~2510000, ... }
 * ```
 */
export function cuotaPrestamo(input: CuotaPrestamoInput): CuotaPrestamoResult {
  const { capital, tna, cuotas, sistema = 'frances' } = input;

  if (capital <= 0) throw new Error('capital debe ser > 0');
  if (tna < 0) throw new Error('tna debe ser >= 0');
  if (cuotas < 1) throw new Error('cuotas debe ser >= 1');

  const tem = tna / 12; // Tasa Efectiva Mensual aproximada
  const tea = Math.pow(1 + tem, 12) - 1; // Tasa Efectiva Anual

  const tabla: CuotaPrestamoResult['tabla'] = [];

  let cuotaMensual: number;
  let formula: string;

  if (sistema === 'frances') {
    // Sistema francés — cuota constante
    if (tem === 0) {
      cuotaMensual = capital / cuotas;
      formula = `cuota = capital / cuotas = ${capital} / ${cuotas} = ${cuotaMensual.toFixed(2)}`;
    } else {
      const factor = (tem * Math.pow(1 + tem, cuotas)) / (Math.pow(1 + tem, cuotas) - 1);
      cuotaMensual = capital * factor;
      formula = `cuota = capital × i × (1+i)^n / ((1+i)^n - 1) = ${capital} × ${tem.toFixed(6)} × ... = ${cuotaMensual.toFixed(2)}`;
    }

    let saldo = capital;
    for (let k = 1; k <= cuotas; k++) {
      const interes = saldo * tem;
      const amortizacion = cuotaMensual - interes;
      saldo -= amortizacion;
      tabla.push({
        cuotaNum: k,
        cuota: round(cuotaMensual),
        interes: round(interes),
        amortizacion: round(amortizacion),
        saldoRestante: round(Math.max(0, saldo)),
      });
    }
  } else {
    // Sistema alemán — capital constante
    const amortizacionFija = capital / cuotas;
    formula = `amortizacionFija = capital / cuotas = ${capital} / ${cuotas} = ${amortizacionFija.toFixed(2)}; cuota_k = amortizacionFija + saldo_k × i`;

    let saldo = capital;
    for (let k = 1; k <= cuotas; k++) {
      const interes = saldo * tem;
      const cuota = amortizacionFija + interes;
      saldo -= amortizacionFija;
      tabla.push({
        cuotaNum: k,
        cuota: round(cuota),
        interes: round(interes),
        amortizacion: round(amortizacionFija),
        saldoRestante: round(Math.max(0, saldo)),
      });
    }
    cuotaMensual = tabla[0].cuota; // primera cuota (más alta)
  }

  const totalAPagar = tabla.reduce((sum, row) => sum + row.cuota, 0);
  const totalIntereses = totalAPagar - capital;

  return {
    cuotaMensual: round(cuotaMensual),
    totalAPagar: round(totalAPagar),
    totalIntereses: round(totalIntereses),
    tea: round(tea * 100, 4) / 100, // 4 decimal precision
    tabla,
    formula,
    sistema,
  };
}

function round(n: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(n * factor) / factor;
}
