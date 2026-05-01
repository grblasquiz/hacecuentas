/**
 * Sueldo Anual Complementario (SAC) — "Aguinaldo"
 *
 * Cálculo del aguinaldo en Argentina según Ley 23.041 (texto vigente).
 *
 * Fuente legal:
 *   https://servicios.infoleg.gob.ar/infolegInternet/anexos/15000-19999/15710/norma.htm
 *
 * Reglas vigentes 2026:
 *   - Aguinaldo = MEJOR SUELDO del semestre devengado / 2
 *   - Si trabajaste menos del semestre completo → proporcional por meses
 *   - Se paga 2 veces al año:
 *       1ra cuota: hasta el 4 de junio + período de gracia (en práctica fin de mayo / primeros días de junio)
 *       2da cuota: hasta el 18 de diciembre
 *   - Sobre el aguinaldo se descuentan: jubilación 11%, obra social 3%, ley 19.032 3%, ganancias si aplica
 *
 * Live calculator: https://hacecuentas.com/calculadora-aguinaldo-sac
 */

export interface AguinaldoSACInput {
  /** Mejor sueldo bruto del semestre, en pesos. */
  mejorSueldoSemestre: number;
  /** Meses trabajados en el semestre (1-6). Default: 6 (semestre completo). */
  mesesTrabajados?: number;
  /** Cuota: 1 = primera (junio), 2 = segunda (diciembre). */
  cuota?: 1 | 2;
}

export interface AguinaldoSACResult {
  /** Monto bruto del aguinaldo, en pesos. */
  montoBruto: number;
  /** Si fue calculado proporcional (no semestre completo). */
  proporcional: boolean;
  /** Fecha máxima legal de pago. */
  fechaPagoMaxima: string;
  /** Fórmula aplicada (para verificación). */
  formula: string;
  /** Fuente legal citada. */
  fuente: string;
}

/**
 * Calcula el aguinaldo (SAC) en Argentina.
 *
 * @example
 * ```ts
 * // Semestre completo
 * aguinaldoSAC({ mejorSueldoSemestre: 850000 });
 * // { montoBruto: 425000, proporcional: false, ... }
 *
 * // Trabajó solo 4 meses (proporcional)
 * aguinaldoSAC({ mejorSueldoSemestre: 850000, mesesTrabajados: 4 });
 * // { montoBruto: 283333.33, proporcional: true, ... }
 * ```
 */
export function aguinaldoSAC(input: AguinaldoSACInput): AguinaldoSACResult {
  const { mejorSueldoSemestre, mesesTrabajados = 6, cuota = 1 } = input;

  if (mejorSueldoSemestre < 0) {
    throw new Error('mejorSueldoSemestre debe ser >= 0');
  }
  if (mesesTrabajados < 0 || mesesTrabajados > 6) {
    throw new Error('mesesTrabajados debe estar entre 0 y 6');
  }

  const semestreCompleto = mesesTrabajados >= 6;
  const proporcional = !semestreCompleto;

  // Aguinaldo = mejor sueldo / 2 (semestre completo)
  // Aguinaldo proporcional = (mejor sueldo / 2) * (meses / 6)
  let montoBruto: number;
  if (semestreCompleto) {
    montoBruto = mejorSueldoSemestre / 2;
  } else {
    montoBruto = (mejorSueldoSemestre / 2) * (mesesTrabajados / 6);
  }

  // Round a 2 decimales
  montoBruto = Math.round(montoBruto * 100) / 100;

  const formula = semestreCompleto
    ? `aguinaldo = mejorSueldoSemestre / 2 = ${mejorSueldoSemestre} / 2 = ${montoBruto}`
    : `aguinaldo = (mejorSueldoSemestre / 2) × (mesesTrabajados / 6) = (${mejorSueldoSemestre} / 2) × (${mesesTrabajados} / 6) = ${montoBruto}`;

  const fechaPagoMaxima = cuota === 1 ? 'hasta el 4 de junio' : 'hasta el 18 de diciembre';

  return {
    montoBruto,
    proporcional,
    fechaPagoMaxima,
    formula,
    fuente: 'Ley 23.041 — texto vigente 2026',
  };
}
