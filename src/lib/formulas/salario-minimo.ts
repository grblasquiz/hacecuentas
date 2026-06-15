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
 * Los valores vienen de la fuente única `src/lib/data/smvm-ar-2026.ts`
 * (la patchea el fetcher `scripts/update-data/fetchers/smvm.ts`).
 */

import { SMVM_MENSUAL, SMVM_HORA, SMVM_FECHA } from '../data/smvm-ar-2026';

export interface Inputs {
  horasSemana: number;
}
export interface Outputs {
  smvmMensual: number;
  smvmHora: number;
  smvmDia: number;
  smvmProporcionalMensual: number;
  fechaVigencia: string;
  _insight?: any;
}

// SMVM_MENSUAL, SMVM_HORA y SMVM_FECHA → src/lib/data/smvm-ar-2026.ts (fuente única).
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

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  const _insight = horasSemana >= 48
    ? {
        title: 'Jornada completa',
        text: `Con **${horasSemana} h/semana** te corresponde el SMVM íntegro: **$${fmt.format(SMVM_MENSUAL)}/mes** (valor hora $${fmt.format(SMVM_HORA)}). Es el piso legal — ningún empleador puede pagarte menos por jornada completa.`,
        tone: 'neutral',
        icon: '💵',
      }
    : {
        title: 'Jornada reducida — proporcional',
        text: `Por **${horasSemana} h/semana** (menos de la jornada legal de 48 h), el mínimo proporcional es **$${fmt.format(smvmProporcionalMensual)}/mes**, calculado sobre el valor hora de $${fmt.format(SMVM_HORA)}.`,
        tone: 'neutral',
        icon: '⏱️',
      };

  return {
    smvmMensual: SMVM_MENSUAL,
    smvmHora: SMVM_HORA,
    smvmDia,
    smvmProporcionalMensual,
    fechaVigencia: SMVM_FECHA,
    _insight,
  };
}
