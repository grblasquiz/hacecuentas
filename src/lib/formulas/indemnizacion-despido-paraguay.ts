/**
 * Indemnización por despido injustificado — PARAGUAY (Código del Trabajo, Ley 213/93).
 *
 * Art. 91: 15 jornales (salarios diarios) por cada año de servicio o fracción
 * mayor a 6 meses. El jornal se obtiene del salario mensual ÷ 30.
 * Art. 94: con ≥10 años de antigüedad (estabilidad), el despido sin causa da
 * derecho a DOBLE indemnización (o reposición).
 *
 *   jornal             = salarioMensual / 30
 *   añosComputables    = años + (meses >= 6 ? 1 : 0)
 *   indemnización      = 15 × jornal × añosComputables
 *   si antigüedad ≥ 10 → × 2  (estabilidad)
 *
 * Fuente: MTESS — Código del Trabajo (Ley 213/93), arts. 91 y 94.
 */
import { PARAGUAY_2026, fmtPYG } from '../data/paraguay-2026';

export interface Inputs {
  salarioMensual: number; // salario mensual en Gs.
  anios?: number;         // años completos de antigüedad
  meses?: number;         // meses adicionales (fracción de año)
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

export function indemnizacionDespidoParaguay(i: Inputs): Outputs {
  const l = PARAGUAY_2026.laboral;
  const salarioMensual = Number(i.salarioMensual) || 0;
  const anios = Math.max(0, Math.floor(Number(i.anios) || 0));
  const meses = Math.max(0, Math.floor(Number(i.meses) || 0));

  if (salarioMensual <= 0) throw new Error('Ingresá tu salario mensual');

  const jornal = salarioMensual / PARAGUAY_2026.diasMes; // salario diario
  // Fracción mayor a 6 meses cuenta como un año entero (art. 91).
  const aniosComputables = anios + (meses > 6 ? 1 : 0);
  // Antigüedad total en años (para la regla de estabilidad de los 10 años).
  const antiguedadAnios = anios + meses / 12;
  const tieneEstabilidad = antiguedadAnios >= l.estabilidadAniosDoble;

  const jornalesPorAnio = l.indemnizacionJornalesPorAnio; // 15
  const indemnizacionBase = jornalesPorAnio * jornal * aniosComputables;
  const indemnizacion = tieneEstabilidad ? indemnizacionBase * 2 : indemnizacionBase;

  const jornadasTotales = jornalesPorAnio * aniosComputables * (tieneEstabilidad ? 2 : 1);

  const _insight = {
    type: 'highlight',
    icon: '⚖️',
    text:
      `Por un despido injustificado con un salario de **${fmtPYG(salarioMensual)}** y ` +
      `**${aniosComputables} año(s) computable(s)** te corresponden **${fmtPYG(indemnizacion)}** ` +
      `(${jornadasTotales} jornales × ${fmtPYG(jornal)}). ` +
      (tieneEstabilidad
        ? `Con **10 años o más** de antigüedad tenés estabilidad: la indemnización se **duplica** (art. 94).`
        : `Cada año de servicio vale **15 jornales**; la fracción mayor a 6 meses cuenta como un año entero (art. 91).`),
  };

  const _table = {
    title: 'Cómo se compone tu indemnización',
    headers: ['Concepto', 'Cálculo', 'Monto'],
    rows: [
      ['Jornal (salario diario)', `${fmtPYG(salarioMensual)} ÷ 30`, fmtPYG(jornal)],
      ['Años computables', `${anios} año(s)${meses > 6 ? ` + fracción > 6 meses (cuenta 1 año)` : meses > 0 ? ` + ${meses} mes(es) (no llega a 6, no suma)` : ''}`, `${aniosComputables}`],
      ['Indemnización base (15 jornales/año)', `15 × ${fmtPYG(jornal)} × ${aniosComputables}`, fmtPYG(indemnizacionBase)],
      ['Estabilidad (≥10 años → doble)', tieneEstabilidad ? '× 2' : 'No aplica', tieneEstabilidad ? fmtPYG(indemnizacion) : '—'],
      ['Total a cobrar', '', fmtPYG(indemnizacion)],
    ],
    note: 'Código del Trabajo (Ley 213/93), arts. 91 y 94. El jornal se calcula sobre 30 días. La fracción de antigüedad mayor a 6 meses se computa como un año completo.',
  };

  return {
    indemnizacion: Math.round(indemnizacion),
    jornal: Math.round(jornal),
    aniosComputables,
    jornalesTotales: jornadasTotales,
    estabilidad: tieneEstabilidad ? 'Sí (≥10 años → doble indemnización)' : 'No',
    desglose: `15 jornales × ${fmtPYG(jornal)} × ${aniosComputables} año(s)${tieneEstabilidad ? ' × 2 (estabilidad)' : ''} = ${fmtPYG(indemnizacion)}`,
    _insight,
    _table,
  };
}
