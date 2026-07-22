import { AUH_JUL_2026 as A, fmtARS } from '../data/argentina-2026';

export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * AUH — 20% retenido y Libreta: cuánto acumulaste y cuánto cobrás al presentarla.
 * ANSES acredita el 80% del monto por mes y retiene el 20% hasta que se presenta la
 * Libreta AUH (controles de salud, vacunas y escolaridad). Estimación al valor vigente
 * ago-2026 ($150.861,90/hijo); el pago real toma el valor histórico de cada mes retenido.
 */
export function compute(i: Inputs): Outputs {
  const hijos = Math.min(15, Math.max(1, Math.round(Number(i.hijos) || 1)));
  const meses = Math.min(12, Math.max(1, Math.round(Number(i.mesesRetenidos) || 12)));
  const monto = Math.max(0, Number(i.montoAUH) || A.montoGeneral);

  const retenidoMensual = monto * A.pctRetenido * hijos;
  const cobroMensual = monto * (1 - A.pctRetenido) * hijos;
  const acumulado = retenidoMensual * meses;

  const out: Outputs = {
    acumuladoRetenido: fmtARS(acumulado),
    retenidoPorMes: fmtARS(retenidoMensual),
    cobroMensualActual: fmtARS(cobroMensual),
    montoBrutoMensual: fmtARS(monto * hijos),
  };

  out._insight = {
    title: `Al presentar la Libreta cobrás ~${fmtARS(acumulado)}`,
    text:
      `Por ${hijos === 1 ? '1 hijo' : hijos + ' hijos'}, ANSES te retiene **${fmtARS(retenidoMensual)}** por mes (el 20% de ${fmtARS(monto * hijos)}) y te acredita **${fmtARS(cobroMensual)}**. ` +
      `Con **${meses} ${meses === 1 ? 'mes' : 'meses'}** retenidos, el acumulado ronda **${fmtARS(acumulado)}** valuado al monto vigente; el pago real se liquida con el valor que tenía la AUH en cada mes retenido, así que va a ser algo menor si hubo aumentos. ` +
      `La Libreta AUH se presenta desde la app o web Mi ANSES (sección Hijos → Libreta AUH) o con el formulario 1.47 en una oficina, y acredita vacunas, controles de salud y escolaridad del año anterior.`,
    tone: 'good',
    icon: '👶',
  };
  return out;
}
