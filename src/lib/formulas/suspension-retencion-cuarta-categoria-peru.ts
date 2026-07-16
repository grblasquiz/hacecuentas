/**
 * Suspensión de retenciones de 4ta categoría (Formulario Virtual 1609) — Perú.
 * SUNAT permite suspender la retención del 8% y los pagos a cuenta cuando la
 * proyección anual de ingresos no supera el umbral que fija cada año.
 *
 * Umbrales derivados de la UIT (verificados contra las cifras publicadas 2025):
 *  - Perceptores de 4ta (o 4ta+5ta) en general: 8,75 × UIT al año.
 *      → 2025 (UIT 5.350): 8,75 × 5.350 = S/ 46.813 ✓
 *  - Perceptores del inciso b) del art. 33 (directores, mandatarios, síndicos,
 *    gestores, regidores…): 7 × UIT al año.
 *      → 2025 (UIT 5.350): 7 × 5.350 = S/ 37.450 ✓
 * UIT 2026 = S/ 5.500 (importada de peru-2026).
 * Base: R.S. 013-2007/SUNAT y resoluciones anuales de actualización.
 */
import { PERU_2026, fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  ingresoMensual4ta: number;  // honorarios mensuales proyectados (S/)
  ingreso5ta?: number;        // ingreso ANUAL de 5ta, si además estás en planilla (S/)
  tipoPerceptor?: string;     // 'general' (8,75 UIT) | 'inciso_b' (7 UIT)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const mensual4ta = Number(i.ingresoMensual4ta) || 0;
  const anual5ta = Number(i.ingreso5ta) || 0;
  const incisoB = String(i.tipoPerceptor || 'general') === 'inciso_b';
  if (mensual4ta <= 0 && anual5ta <= 0) throw new Error('Ingresá tu honorario mensual de 4ta');

  const uit = PERU_2026.uit;
  const multiplicador = incisoB ? 7 : 8.75;
  const umbralAnual = multiplicador * uit;
  const umbralMensual = umbralAnual / 12;

  const proyeccionAnual = mensual4ta * 12 + anual5ta;
  const puedeSuspender = proyeccionAnual <= umbralAnual;

  // Retención del 8% si NO suspende (aplica a recibos > S/ 1.500).
  const retencionMensual = mensual4ta > 1500 ? mensual4ta * 0.08 : 0;
  const retencionAnual = retencionMensual * 12;

  const _insight = {
    title: puedeSuspender ? 'Podés suspender la retención de 4ta' : 'No calificás para la suspensión',
    text: puedeSuspender
      ? `Tu proyección anual es **${fmtPEN(proyeccionAnual)}**, por debajo del umbral de **${fmtPEN(umbralAnual)}** (${multiplicador.toLocaleString('es-PE', { maximumFractionDigits: 2 })} UIT). Podés presentar el **Formulario Virtual 1609** en SUNAT y cobrar tus recibos completos, sin la retención del 8%. Te ahorrás unos **${fmtPEN(retencionAnual)}** de retención al año (que igual regularizarías en la declaración anual).`
      : `Tu proyección anual es **${fmtPEN(proyeccionAnual)}**, por encima del umbral de **${fmtPEN(umbralAnual)}** (${multiplicador.toLocaleString('es-PE', { maximumFractionDigits: 2 })} UIT), así que **no** procede la suspensión: te seguirán reteniendo el **8%** en recibos mayores a S/ 1.500 (**${fmtPEN(retencionMensual)}/mes**). Podrías facturar hasta **${fmtPEN(umbralMensual)}/mes** para quedar dentro del umbral.`,
    tone: puedeSuspender ? 'good' : 'warn',
    icon: '🧾',
  };
  const _chart = {
    type: 'bar',
    labels: ['Tu proyección anual', 'Umbral de suspensión'],
    values: [Math.round(proyeccionAnual), Math.round(umbralAnual)],
    prefix: 'S/ ',
    ariaLabel: `Proyección anual ${fmtPEN(proyeccionAnual)} frente al umbral de suspensión ${fmtPEN(umbralAnual)}.`,
  };

  return {
    puedeSuspender: puedeSuspender ? 'Sí, podés suspenderla' : 'No (superás el umbral)',
    umbralAnual: fmtPEN(umbralAnual),
    umbralMensual: fmtPEN(umbralMensual),
    proyeccionAnual: fmtPEN(proyeccionAnual),
    retencionMensual: retencionMensual > 0 ? fmtPEN(retencionMensual) : 'S/ 0 (recibo ≤ S/ 1.500)',
    detalle: `Proyección ${fmtPEN(proyeccionAnual)} (${fmtPEN(mensual4ta)}/mes × 12${anual5ta > 0 ? ` + 5ta ${fmtPEN(anual5ta)}` : ''}) vs umbral ${fmtPEN(umbralAnual)} = ${multiplicador.toLocaleString('es-PE', { maximumFractionDigits: 2 })} UIT (${fmtPEN(umbralMensual)}/mes) → ${puedeSuspender ? 'SUSPENSIÓN habilitada (Form. 1609)' : 'no procede la suspensión'}.`,
    _insight,
    _chart,
  };
}
