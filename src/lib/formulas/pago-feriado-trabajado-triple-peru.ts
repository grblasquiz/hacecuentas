/**
 * Pago por trabajar en feriado — Perú (D. Leg. 713, arts. 5-9).
 * Si trabajas un feriado nacional (ej. 28 y 29 de julio) SIN descanso sustitutorio,
 * el día se paga "triple": 1 remuneración diaria ya incluida en tu sueldo mensual
 * + 1 remuneración por el día efectivamente trabajado + 1 sobretasa del 100%.
 * Con descanso sustitutorio acordado, no corresponde pago adicional.
 * Remuneración diaria = sueldo mensual ÷ 30.
 * Fuente: El Peruano / SUNAFIL. Verificado 2026-07-18.
 */
import { fmtPEN2 } from '../data/peru-2026.ts';

export interface Inputs {
  sueldo?: number | string;     // sueldo mensual bruto (S/)
  feriados?: number | string;   // cantidad de feriados trabajados (ej. 2 si trabajas 28 y 29)
  descanso?: string;            // 'no' | 'si' (descanso sustitutorio)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const sueldo = Math.max(0, Number(i.sueldo) || 0);
  const feriados = Math.max(1, Math.min(10, Math.floor(Number(i.feriados) || 1)));
  const conDescanso = String(i.descanso || 'no') === 'si';

  const remDiaria = sueldo / 30;
  // Sin descanso sustitutorio: se agregan 2 remuneraciones diarias por feriado
  // (día trabajado + sobretasa 100%); la 3ra ya está dentro del sueldo mensual.
  const adicionalPorDia = conDescanso ? 0 : remDiaria * 2;
  const adicionalTotal = adicionalPorDia * feriados;
  const valorDia = conDescanso ? remDiaria : remDiaria * 3;
  const sueldoDelMes = sueldo + adicionalTotal;

  const _insight = {
    title: conDescanso ? 'Con descanso sustitutorio no hay pago extra' : 'Te corresponde pago triple',
    text: conDescanso
      ? `Como acordaste **descanso sustitutorio**, el feriado trabajado se compensa con otro día libre pagado y tu sueldo del mes queda en **${fmtPEN2(sueldo)}**. Si no te dan ese descanso, el día vale triple: **${fmtPEN2(remDiaria * 3)}**.`
      : `Tu día vale **${fmtPEN2(remDiaria)}** (sueldo ÷ 30). Por trabajar ${feriados === 1 ? 'el feriado' : `${feriados} feriados`} sin descanso sustitutorio, cada día feriado vale **${fmtPEN2(valorDia)}** (día del sueldo + día trabajado + sobretasa 100%). En tu boleta de julio deben aparecer **${fmtPEN2(adicionalTotal)} adicionales**: cobras **${fmtPEN2(sueldoDelMes)}** en el mes.`,
    tone: conDescanso ? 'neutral' : 'good',
    icon: '🎆',
  };

  const _chart = {
    type: 'bar' as const,
    labels: ['Día normal', 'Feriado trabajado'],
    values: [Math.round(remDiaria * 100) / 100, Math.round(valorDia * 100) / 100],
    prefix: 'S/ ',
    ariaLabel: `Un día normal vale ${fmtPEN2(remDiaria)} y el feriado trabajado ${fmtPEN2(valorDia)}.`,
  };

  return {
    remuneracionDiaria: fmtPEN2(remDiaria),
    valorDiaFeriado: fmtPEN2(valorDia),
    pagoAdicional: conDescanso ? 'S/ 0 (descanso sustitutorio)' : fmtPEN2(adicionalTotal),
    sueldoDelMes: fmtPEN2(sueldoDelMes),
    detalle: conDescanso
      ? `Feriado con descanso sustitutorio: se compensa con día libre pagado, sin monto extra. Sueldo del mes: ${fmtPEN2(sueldo)}.`
      : `Diaria ${fmtPEN2(remDiaria)} × 2 (día trabajado + sobretasa 100%) × ${feriados} feriado(s) = ${fmtPEN2(adicionalTotal)} extra. Mes: ${fmtPEN2(sueldo)} + ${fmtPEN2(adicionalTotal)} = ${fmtPEN2(sueldoDelMes)}.`,
    _insight,
    _chart,
  };
}
