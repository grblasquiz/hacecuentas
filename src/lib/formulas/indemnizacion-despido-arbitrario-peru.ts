/** Indemnización por despido arbitrario Perú — 1,5 sueldos por año, tope 12 sueldos. */
import { fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  sueldo: number;
  aniosTrabajados: number;
  mesesAdicionales?: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const sueldo = Number(i.sueldo) || 0;
  const anios = Math.max(0, Number(i.aniosTrabajados) || 0);
  const mesesAdic = Math.max(0, Math.min(11, Number(i.mesesAdicionales) || 0));
  if (sueldo <= 0) throw new Error('Ingresá tu remuneración mensual');

  // Indemnización por despido arbitrario (D.S. 003-97-TR, art. 38):
  // 1,5 remuneraciones (una y media) por cada año completo de servicios.
  // La fracción de año se paga por dozavos (meses) y treintavos (días).
  const remPorAnio = sueldo * 1.5;
  const porAniosCompletos = anios * remPorAnio;
  const porMeses = (remPorAnio / 12) * mesesAdic;
  let indemnizacion = porAniosCompletos + porMeses;

  // Tope legal: máximo de 12 remuneraciones.
  const tope = sueldo * 12;
  const aplicaTope = indemnizacion > tope;
  if (aplicaTope) indemnizacion = tope;

  const _insight = {
    title: 'Tu indemnización por despido arbitrario',
    text: `Con un sueldo de **${fmtPEN(sueldo)}** y **${anios} año(s)${mesesAdic ? ` y ${mesesAdic} mes(es)` : ''}** trabajados te corresponde una indemnización de **${fmtPEN(indemnizacion)}** (1,5 sueldos por año).${aplicaTope ? ` Se aplicó el **tope de 12 sueldos** (${fmtPEN(tope)}).` : ''} Es independiente de tu CTS, gratificaciones y vacaciones truncas, que se pagan aparte.`,
    tone: 'info',
    icon: '⚖️',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Por años completos', value: Math.round(aplicaTope ? Math.min(porAniosCompletos, tope) : porAniosCompletos) },
      { label: 'Por meses (dozavos)', value: Math.round(aplicaTope ? Math.max(0, tope - porAniosCompletos) : porMeses) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(indemnizacion),
    centerLabel: 'Indemnización',
    ariaLabel: `Indemnización por despido arbitrario: ${fmtPEN(indemnizacion)} por ${anios} años y ${mesesAdic} meses.`,
  };

  return {
    indemnizacion: fmtPEN(indemnizacion),
    porAnio: fmtPEN(remPorAnio),
    tope: fmtPEN(tope),
    detalle: `${anios} año(s) × 1,5 sueldos${mesesAdic ? ` + ${mesesAdic} mes(es) en dozavos` : ''}${aplicaTope ? ` · limitado al tope de 12 sueldos (${fmtPEN(tope)})` : ''}.`,
    _insight,
    _chart,
  };
}
