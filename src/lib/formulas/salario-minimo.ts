/**
 * Salario Mínimo Vital y Móvil Argentina (SMVM) — valores oficiales CNEPySMVyM.
 *
 * El valor lo fija el Consejo Nacional del Empleo, la Productividad y el SMVM
 * por resolución. Las resoluciones 9/2025 y 4/2026 establecen un cronograma de
 * aumentos entre noviembre de 2025 y abril de 2027.
 *
 * Valores jornada completa (8h diarias / 48h semanales = 200h mensuales aprox):
 *   - smvmHora = valor publicado para trabajadores jornalizados
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
const HORAS_SEMANA_REFERENCIA = 48;

export function salarioMinimo(i: Inputs): Outputs {
  const horasSemana = Math.max(1, Math.min(84, Number(i.horasSemana) || 48));

  // Valor diario: jornada legal de 8h × valor hora oficial.
  const smvmDia = Math.round(SMVM_HORA * 8);

  // Para mensualizados, el proporcional se calcula sobre el monto mensual de referencia.
  const proporcion = Math.min(1, horasSemana / HORAS_SEMANA_REFERENCIA);
  const smvmProporcionalMensual = Math.round(SMVM_MENSUAL * proporcion);

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  const _insight = proporcion === 1
    ? {
        title: 'Jornada completa',
        text: `Con **${horasSemana} h/semana** te corresponde el SMVM íntegro: **$${fmt.format(SMVM_MENSUAL)}/mes** (valor hora $${fmt.format(SMVM_HORA)}). Es el piso legal — ningún empleador puede pagarte menos por jornada completa.`,
        tone: 'neutral',
        icon: '💵',
      }
    : {
        title: 'Jornada reducida — proporcional',
        text: `Por **${horasSemana} h/semana** (menos de la jornada legal de 48 h), el mínimo proporcional es **$${fmt.format(smvmProporcionalMensual)}/mes**, calculado como proporción del salario mensual de jornada completa. Si tu convenio fija una jornada de referencia distinta, el resultado cambia.`,
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
