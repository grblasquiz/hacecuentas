/**
 * Subsidio de maternidad del IPS — PARAGUAY.
 *
 * La Ley 5508/15 (Promoción, Protección de la Maternidad y Apoyo a la Lactancia)
 * estableció un permiso de maternidad de 18 semanas (126 días corridos). Durante
 * ese reposo, la trabajadora asegurada recibe del IPS un subsidio equivalente al
 * 100% de su remuneración, calculado sobre el salario del último mes percibido
 * antes del parto. El pago se fracciona en 5 cuotas.
 *
 * Requisitos: tener al menos 4 meses de aportes al IPS y, dentro de ese período,
 * 36 días ininterrumpidos de trabajo efectivo. El permiso puede extenderse en
 * casos de parto múltiple, prematuro o de hijo con discapacidad.
 *
 * Moneda: guaraníes (PYG).
 */
import { fmtPYG } from '../data/paraguay-2026.ts';

const DIAS_REPOSO = 126;   // 18 semanas de permiso de maternidad
const CUOTAS = 5;          // el IPS fracciona el pago en 5 cuotas
const DIAS_MES = 30;

export interface Inputs {
  salarioMensual: number; // salario del último mes antes del parto, en Gs.
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; }

export function compute(i: Inputs): Outputs {
  const salario = Number(i.salarioMensual) || 0;
  if (salario <= 0) throw new Error('Ingresá tu salario mensual (último mes antes del parto)');

  const salarioDiario = salario / DIAS_MES;
  const subsidioTotal = Math.round(salarioDiario * DIAS_REPOSO); // 100% × 126 días
  const cuota = Math.round(subsidioTotal / CUOTAS);
  const mesesEquivalentes = DIAS_REPOSO / DIAS_MES; // 4,2 meses

  const _table = {
    title: 'Subsidio de maternidad IPS (18 semanas al 100%)',
    headers: ['Concepto', 'Valor'],
    rows: [
      ['Salario mensual (base)', fmtPYG(salario)],
      ['Salario diario (÷30)', fmtPYG(Math.round(salarioDiario))],
      ['Días de reposo', `${DIAS_REPOSO} (18 semanas)`],
      ['Subsidio total (100%)', fmtPYG(subsidioTotal)],
      [`Cada cuota (de ${CUOTAS})`, fmtPYG(cuota)],
    ],
    note: 'Ley 5508/15. El IPS abona el 100% del salario diario promedio del último mes por 126 días, en 5 cuotas. Requiere 4 meses de aportes (con 36 días ininterrumpidos de trabajo efectivo).',
  };

  const _insight = {
    type: 'highlight',
    icon: '🤰',
    text: `Con un salario de **${fmtPYG(salario)}**, el IPS te paga un subsidio total de **${fmtPYG(subsidioTotal)}** por las 18 semanas (equivale a ~${mesesEquivalentes.toLocaleString('de-DE', { maximumFractionDigits: 1 })} meses de sueldo), en 5 cuotas de **${fmtPYG(cuota)}** cada una.`,
  };

  return {
    subsidioTotal: fmtPYG(subsidioTotal),
    subsidioDiario: fmtPYG(Math.round(salarioDiario)),
    cuota: fmtPYG(cuota),
    diasReposo: `${DIAS_REPOSO} días (18 semanas)`,
    detalle: `Salario diario ${fmtPYG(Math.round(salarioDiario))} × 126 días = ${fmtPYG(subsidioTotal)} (100%), pagado en 5 cuotas de ${fmtPYG(cuota)}.`,
    _insight,
    _table,
  };
}
