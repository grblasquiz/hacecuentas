/**
 * Salario Mínimo Vital y Móvil Argentina (SMVM) — valores oficiales CNEPySMVyM.
 *
 * El valor lo fija el Consejo Nacional del Empleo, la Productividad y el SMVM
 * por resolución. Para 2026: Resolución 9/2025 establece un cronograma de
 * aumentos entre noviembre 2025 y agosto 2026.
 *
 * Valores jornada completa (8h diarias / 48h semanales = 200h mensuales aprox):
 *   - smvmMensual / 200h ≈ smvmHora oficial
 *   - smvmDia = smvmHora × 8
 *
 * El fetcher `scripts/update-data/fetchers/salario-minimo.ts` patchea
 * SMVM_MENSUAL, SMVM_HORA y FECHA como literales.
 */

export interface Inputs {
  horasSemana: number;
}
export interface Outputs {
  smvmMensual: number;
  smvmHora: number;
  smvmDia: number;
  smvmProporcionalMensual: number;
  fechaVigencia: string;
}

// Valores oficiales abril 2026 — Res 9/2025 CNEPySMVyM
const SMVM_MENSUAL = 357_800;
const SMVM_HORA = 1_789;
const FECHA = 'abril 2026 (Res 9/2025)';
// Jornada legal completa: 48h/sem × 52 sem / 12 meses ≈ 208h. La resolución
// oficial redondea a 200h (8h × 25 días hábiles) al fijar el valor hora.
const HORAS_MES_LEGAL = 200;

export function salarioMinimo(i: Inputs): Outputs {
  const horasSemana = Math.max(1, Math.min(84, Number(i.horasSemana) || 48));

  // Valor diario: jornada legal de 8h × valor hora oficial.
  const smvmDia = Math.round(SMVM_HORA * 8);

  // Si la jornada del usuario es menor a la legal, calculamos su proporcional
  // mensual. Jornada completa (≥48h) → SMVM mensual íntegro.
  const horasMesUsuario = (horasSemana * 52) / 12;
  const smvmProporcionalMensual =
    horasSemana >= 48
      ? SMVM_MENSUAL
      : Math.round(SMVM_HORA * horasMesUsuario);

  return {
    smvmMensual: SMVM_MENSUAL,
    smvmHora: SMVM_HORA,
    smvmDia,
    smvmProporcionalMensual,
    fechaVigencia: FECHA,
  };
}
