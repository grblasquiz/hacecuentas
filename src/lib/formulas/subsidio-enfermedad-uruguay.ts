/**
 * Subsidio por Enfermedad (DISSE / BPS) — Uruguay 2026.
 *
 * Prestación para trabajadores con certificado médico que no pueden trabajar.
 *   - Monto = 70% del PROMEDIO de las remuneraciones nominales de los últimos 180
 *     días (6 meses) previos al mes de inicio de la licencia, más la cuota parte
 *     del aguinaldo (que BPS retiene y paga por separado).
 *   - Tope mensual 2026 = $67.754.
 *   - Carencia: se paga a partir del 4º día de certificación (los 3 primeros no se
 *     cobran), salvo internación (hospitalaria o domiciliaria), que se paga desde
 *     el día 1.
 *
 * El tope 2026 ($67.754) lo fija BPS; el 70% y la carencia surgen de la
 * normativa (Decreto-Ley 14.407 y modificativas).
 */
import { fmtUYU } from '../data/uruguay-2026.ts';

export interface Inputs {
  /** Promedio nominal de los últimos 6 meses (180 días), en pesos. */
  promedio6meses: number;
  /** Días de certificado médico. */
  diasCertificado: number;
  /** ¿Hay internación? (se cobra desde el día 1, sin carencia). */
  internacion?: string;
}

export interface Outputs {
  subsidioMensual: string;
  subsidioDiario: string;
  diasPagos: number;
  subsidioPeriodo: string;
  detalle: string;
  _insight?: any;
  _table?: any;
}

const PORCENTAJE = 0.7; // 70%
const TOPE_MENSUAL = 67754; // tope 2026 (BPS)
const CARENCIA_DIAS = 3; // primeros 3 días no se pagan (salvo internación)

export function compute(i: Inputs): Outputs {
  const promedio = Math.max(0, Number(i.promedio6meses) || 0);
  const dias = Math.max(0, Math.floor(Number(i.diasCertificado) || 0));
  const internacion = String(i.internacion || 'no') === 'si';

  const sinTope = promedio * PORCENTAJE;
  const mensual = Math.min(sinTope, TOPE_MENSUAL);
  const diario = mensual / 30;
  const carencia = internacion ? 0 : CARENCIA_DIAS;
  const diasPagos = Math.max(0, dias - carencia);
  const periodo = diario * diasPagos;

  const topeAplica = sinTope > TOPE_MENSUAL;

  const detalle =
    `Promedio 6 meses ${fmtUYU(promedio)} × 70% = ${fmtUYU(sinTope)}` +
    (topeAplica ? ` (limitado al tope de ${fmtUYU(TOPE_MENSUAL)})` : '') +
    `. Subsidio mensual ${fmtUYU(mensual)} (${fmtUYU(diario)}/día). ` +
    `Con ${dias} días de certificado${internacion ? ' e internación (sin carencia)' : ` menos ${CARENCIA_DIAS} de carencia`}, se pagan ${diasPagos} días → ${fmtUYU(periodo)}.`;

  return {
    subsidioMensual: fmtUYU(mensual),
    subsidioDiario: fmtUYU(diario),
    diasPagos,
    subsidioPeriodo: fmtUYU(periodo),
    detalle,
    _insight: {
      type: 'highlight',
      icon: '🩺',
      text: `Con un promedio de **${fmtUYU(promedio)}**, el subsidio es **${fmtUYU(mensual)}** por mes (70% del promedio${topeAplica ? `, limitado al tope de ${fmtUYU(TOPE_MENSUAL)}` : ''}). Por ${diasPagos} días efectivos cobrarías **${fmtUYU(periodo)}**${internacion ? ' (con internación se paga desde el día 1)' : ` (los primeros ${CARENCIA_DIAS} días no se pagan)`}.`,
      tone: 'info' as const,
    },
    _table: {
      title: 'Subsidio por enfermedad mensual (70% del promedio, tope 2026)',
      headers: ['Promedio 6 meses', '70% del promedio', 'Subsidio mensual (con tope)'],
      rows: [25000, 40000, 60000, 90000, 120000].map((p) => {
        const bruto = p * PORCENTAJE;
        return [fmtUYU(p), fmtUYU(bruto), fmtUYU(Math.min(bruto, TOPE_MENSUAL))];
      }),
      note: `El subsidio es el 70% del promedio de los últimos 180 días, con tope mensual de ${fmtUYU(TOPE_MENSUAL)} (2026). Se paga desde el 4º día del certificado (los 3 primeros son de carencia), salvo internación. Además genera cuota parte de aguinaldo. Fuente: BPS.`,
    },
  };
}
