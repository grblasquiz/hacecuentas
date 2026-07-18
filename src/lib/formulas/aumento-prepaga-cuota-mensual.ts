import { PREPAGAS_JUL_2026 as P, fmtARS } from '../data/argentina-2026';

export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Aumento de la cuota de prepaga: nueva cuota con el % del mes (jul-2026: 2,1% promedio,
 * OSDE hasta 2,3%, Omint hasta 2,9%) + proyección si el ritmo se repite N meses.
 */
export function compute(i: Inputs): Outputs {
  const cuota = Math.max(0, Number(i.cuotaActual) || 0);
  const pct = Math.min(50, Math.max(0, Number(i.aumentoPct) || P.aumentoPromedioPct));
  const meses = Math.min(24, Math.max(1, Math.round(Number(i.mesesProyeccion) || 6)));

  const nueva = cuota * (1 + pct / 100);
  const diferencia = nueva - cuota;
  const proyectada = cuota * Math.pow(1 + pct / 100, meses);
  const extraAnual = diferencia * 12;

  const fmtPct = (v: number) => v.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';

  const out: Outputs = {
    nuevaCuota: fmtARS(nueva),
    diferenciaMensual: fmtARS(diferencia),
    cuotaProyectada: `${fmtARS(proyectada)} en ${meses} meses`,
    costoExtraAnualizado: fmtARS(extraAnual),
  };

  out._insight = {
    title: `Tu cuota pasa a ${fmtARS(nueva)}`,
    text:
      `Con el aumento de **${fmtPct(pct)}**, pagás **${fmtARS(diferencia)}** más por mes (${fmtARS(extraAnual)} al año si el valor se mantiene). ` +
      `Si el ritmo de ${fmtPct(pct)} mensual se repitiera, en ${meses} meses la cuota llegaría a **${fmtARS(proyectada)}** por el efecto compuesto. ` +
      `En julio 2026 la mayoría de las prepagas ajustó 2,1% (OSDE hasta 2,3%, Omint hasta 2,9%) y el año acumula ~16%. El aumento exacto de tu plan figura en la comunicación mensual obligatoria de tu prepaga.`,
    tone: 'neutral',
    icon: '🏥',
  };
  return out;
}
