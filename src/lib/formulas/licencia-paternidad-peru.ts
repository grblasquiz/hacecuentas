/**
 * Calculadora de licencia de paternidad — Perú 2026 (Ley 30807, modifica Ley 29409).
 *
 * La licencia de paternidad se cuenta en DÍAS CALENDARIO CONSECUTIVOS (no hábiles) y la
 * paga el EMPLEADOR con goce de haber (NO es subsidio de EsSalud, a diferencia de la
 * licencia de maternidad). El valor pagado = remuneración diaria × días de licencia.
 *
 * Duraciones (días calendario consecutivos), Ley 30807 art. 2:
 *   - 10 días: parto natural o cesárea (caso general)
 *   - 20 días: nacimiento prematuro o parto múltiple
 *   - 30 días: nacimiento con enfermedad congénita terminal o discapacidad severa
 *   - 30 días: complicaciones graves en la salud de la madre
 *
 * La ADOPCIÓN NO está en la Ley 30807 (que sólo tiene "Artículo único" modificando el
 * art. 2 de la Ley 29409). La licencia por adopción es otra norma: Ley 27409 → 30 días
 * NATURALES, niño no mayor de 12 años, y AHÍ la falta de aviso (15 días naturales) SÍ
 * hace perder el derecho. Por eso se trata como supuesto aparte con norma propia.
 *
 * Fuente: Ley 30807 (El Peruano, 05-07-2018) — https://busquedas.elperuano.pe/dispositivo/NL/1666491-2
 *         Reglamento Ley 29409, DS 014-2010-TR (aviso 15 días naturales, art. 7)
 *         Ley 27409 — licencia laboral por adopción (30 días naturales, menor de 12 años)
 *         gob.pe / MTPE — https://www.gob.pe/14406-solicitar-licencia-por-paternidad
 */
import { PERU_2026, fmtPEN } from '../data/peru-2026.ts';

// Días calendario de licencia por supuesto — Ley 30807, art. 2.
// fuente: Ley 30807, El Peruano 05-07-2018, https://busquedas.elperuano.pe/dispositivo/NL/1666491-2
const DIAS_POR_SUPUESTO: Record<string, { dias: number; etiqueta: string; norma: string }> = {
  normal: { dias: 10, etiqueta: 'Parto natural o cesárea', norma: 'Ley 30807, art. 2.1' },
  prematuro: { dias: 20, etiqueta: 'Nacimiento prematuro', norma: 'Ley 30807, art. 2.2.a' },
  multiple: { dias: 20, etiqueta: 'Parto múltiple (mellizos, trillizos…)', norma: 'Ley 30807, art. 2.2.a' },
  enfermedad: { dias: 30, etiqueta: 'Enfermedad congénita terminal o discapacidad severa', norma: 'Ley 30807, art. 2.2.b' },
  complicaciones: { dias: 30, etiqueta: 'Complicaciones graves en la salud de la madre', norma: 'Ley 30807, art. 2.2.c' },
  // La adopción NO es licencia de paternidad de la Ley 30807: es la Ley 27409 (30 días NATURALES).
  adopcion: { dias: 30, etiqueta: 'Adopción de menor (no mayor de 12 años) — Ley 27409', norma: 'Ley 27409 (30 días naturales)' },
};

export interface Inputs {
  sueldoMensual: number;       // remuneración mensual del trabajador (S/)
  supuesto?: string;           // 'normal' | 'prematuro' | 'multiple' | 'enfermedad' | 'complicaciones' | 'adopcion'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const sueldo = Number(i.sueldoMensual);
  const supuesto = String(i.supuesto || 'normal');

  if (!Number.isFinite(sueldo) || sueldo <= 0) {
    throw new Error('Ingresá tu remuneración mensual (S/) mayor a 0');
  }
  const caso = DIAS_POR_SUPUESTO[supuesto] ?? DIAS_POR_SUPUESTO.normal;

  // La remuneración diaria laboral se calcula sobre 30 días (criterio MTPE para descuentos
  // y goce de haber). La licencia es con goce de haber: el sueldo no se reduce.
  const remDiaria = sueldo / 30;
  const diasLicencia = caso.dias;
  const valorLicencia = remDiaria * diasLicencia;

  // Cuántos de esos días calendario serían, en promedio, días hábiles (lun-vie) que el
  // trabajador deja de asistir. Aprox: 5/7 de los días calendario. Solo informativo.
  const diasHabilesAprox = Math.round((diasLicencia * 5) / 7);

  // Comparación vs el caso general (10 días) para mostrar el "extra" en supuestos especiales.
  const diasExtra = diasLicencia - DIAS_POR_SUPUESTO.normal.dias;

  const esAdopcion = supuesto === 'adopcion';
  const tipoDia = esAdopcion ? 'días naturales' : 'días calendario consecutivos';

  const tone = diasLicencia >= 30 ? 'warn' : diasLicencia >= 20 ? 'good' : 'neutral';
  const _insight = {
    title: `Licencia: ${diasLicencia} ${esAdopcion ? 'días naturales' : 'días calendario'}`,
    text:
      `Por **${caso.etiqueta.toLowerCase()}** te corresponden **${diasLicencia} ${tipoDia}** ` +
      `de licencia con goce de haber (${caso.norma}). Con una remuneración de **${fmtPEN(sueldo)}**, ` +
      `el período equivale a **${fmtPEN(valorLicencia)}** de sueldo pagado por tu **empleador** ` +
      (diasExtra > 0
        ? `(${diasExtra} días más que el caso general de 10 días). `
        : `. `) +
      (esAdopcion
        ? `La **adopción** se rige por la **Ley 27409** (no por la Ley 30807): el niño no debe ser mayor de 12 años y, a diferencia de la licencia de paternidad, **acá la falta de aviso al empleador SÍ hace perder el derecho**.`
        : `Son **días calendario** (incluyen fines de semana y feriados), **no** días hábiles, y ` +
          `**no** es un subsidio de EsSalud: lo paga directamente la empresa.`),
    tone,
    icon: '👨‍🍼',
  };

  const _chart = {
    type: 'bar',
    bars: [
      { label: 'Parto natural/cesárea', value: 10 },
      { label: 'Prematuro / múltiple', value: 20 },
      { label: 'Enfermedad / complicaciones', value: 30 },
    ],
    highlightLabel:
      diasLicencia === 10 ? 'Parto natural/cesárea'
        : diasLicencia === 20 ? 'Prematuro / múltiple'
          : 'Enfermedad / complicaciones',
    suffix: ' días',
    centerValue: `${diasLicencia} días`,
    centerLabel: 'tu licencia',
    ariaLabel: `Licencia de paternidad: 10 días por parto natural o cesárea, 20 por nacimiento prematuro o parto múltiple, 30 por enfermedad congénita terminal, discapacidad severa o complicaciones graves de la madre. Tu caso: ${diasLicencia} días.`,
  };

  return {
    diasLicencia: `${diasLicencia} ${esAdopcion ? 'días naturales' : 'días calendario'}`,
    supuestoTexto: caso.etiqueta,
    valorLicencia: fmtPEN(valorLicencia),
    remuneracionDiaria: fmtPEN(remDiaria),
    diasHabilesAprox: `≈ ${diasHabilesAprox} días hábiles`,
    detalle:
      `${diasLicencia} ${esAdopcion ? 'días naturales' : 'días calendario'} × ${fmtPEN(remDiaria)}/día = ${fmtPEN(valorLicencia)} (con goce de haber, paga el empleador). ` +
      `Equivale a ~${diasHabilesAprox} días hábiles de ausencia.` +
      (esAdopcion ? ' Adopción: Ley 27409, niño no mayor de 12 años; avisar al empleador es obligatorio para conservar el derecho.' : ''),
    _insight,
    _chart,
  };
}
