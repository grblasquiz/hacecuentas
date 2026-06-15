/**
 * Licencia de maternidad y subsidio EsSalud — Perú 2026.
 * - Descanso: 98 días (49 prenatal + 49 postnatal). Ley 26644 (art. 1, mod. Ley 30367).
 *   fuente: EsSalud, https://www.essalud.gob.pe/maternidad/, 2026
 * - Parto múltiple o hijo con discapacidad: +30 días → 128 días. (Ley 26644, art. 1).
 * - Subsidio = (suma de las 12 últimas remuneraciones ÷ 360) × N° días subsidiados.
 *   Se excluyen gratificaciones y conceptos extraordinarios.
 *   fuente: EsSalud, http://www.essalud.gob.pe/downloads/ANEXO_12_REMUNERACIONES.pdf
 * - Régimen CAS: el viejo tope de 30% UIT quedó DEROGADO por la homologación gradual de la
 *   base imponible de EsSalud (Proyecto/Ley de homologación, texto sustitutorio aprobado el
 *   13-dic-2024): base = 65% del ingreso (>55% UIT) → 80% desde 01-ene-2025 → 100% desde
 *   01-ene-2026. En 2026 la base llega al 100% del ingreso mensual, por lo que el subsidio
 *   CAS se calcula sobre la remuneración completa, igual que el régimen privado.
 *   fuente: Congreso de la República, https://comunicaciones.congreso.gob.pe/noticias/pleno-aprueba-dictamen-para-homologar-aportes-de-seguridad-social-en-salud/, 2024
 */
import { fmtPEN } from '../data/peru-2026.ts';

// Parámetros del subsidio por maternidad (no están en la tabla maestra)
// fuente: EsSalud, https://www.essalud.gob.pe/maternidad/, 2026
const DIAS_BASE = 98;            // 49 prenatal + 49 postnatal (Ley 26644)
const DIAS_EXTRA_MULTIPLE = 30;  // parto múltiple / hijo con discapacidad → 128 total
const DIAS_DIVISOR = 360;        // base de cálculo: suma 12 remuneraciones ÷ 360

export interface Inputs {
  remuneracionMensual: number; // remuneración mensual promedio (sin gratificaciones), S/
  partoMultiple?: string;      // 'si' suma 30 días (parto múltiple o hijo con discapacidad)
  regimen?: string;            // 'privado' (sin tope) | 'cas' (tope 30% UIT)
  difierePrenatal?: string;    // 'si' = postergó parte del prenatal al postnatal (informativo)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const rem = Number(i.remuneracionMensual) || 0;
  const multiple = String(i.partoMultiple || 'no') === 'si';
  const regimen = String(i.regimen || 'privado');
  if (rem <= 0) throw new Error('Ingresá tu remuneración mensual promedio (S/)');

  // Días de descanso/subsidio
  const diasTotales = DIAS_BASE + (multiple ? DIAS_EXTRA_MULTIPLE : 0);
  const diasPrenatal = 49;
  const diasPostnatal = diasTotales - diasPrenatal; // 49 ó 79

  // Remuneración diaria: suma de 12 remuneraciones ÷ 360 = remuneración mensual ÷ 30
  const remDiaria = (rem * 12) / DIAS_DIVISOR;

  // Subsidio bruto = remuneración diaria × días subsidiados.
  // Desde 2026 NO hay tope CAS: la base imponible de EsSalud se homologó al 100% del
  // ingreso mensual (texto sustitutorio aprobado el 13-dic-2024), así que el subsidio CAS
  // se calcula sobre la remuneración completa, igual que el régimen privado.
  const subsidioTotal = remDiaria * diasTotales;
  const esCas = regimen === 'cas';

  const subsidioMensual = subsidioTotal / (diasTotales / 30);
  const subsidioPrenatal = remDiaria * diasPrenatal;
  const subsidioPostnatal = subsidioTotal - subsidioPrenatal;
  const equivalenteSueldos = subsidioTotal / rem;

  const _insight = {
    title: 'Tu subsidio por maternidad',
    text:
      `Te corresponden **${diasTotales} días** de descanso (${diasPrenatal} prenatal + ${diasPostnatal} postnatal)` +
      (multiple ? ' por parto múltiple o hijo con discapacidad' : '') +
      `. EsSalud te paga un subsidio total de **${fmtPEN(subsidioTotal)}**, equivalente a tu remuneración diaria (**${fmtPEN(remDiaria)}**) por cada día de licencia. Esto cubre alrededor de **${equivalenteSueldos.toFixed(1)} sueldos** mientras estás de licencia.` +
      (esCas
        ? ' Desde 2026, el régimen **CAS** ya no tiene el viejo tope de 30% de la UIT: la base de EsSalud se homologó al 100% de tu ingreso mensual, así que cobrás como en el régimen privado.'
        : ''),
    tone: 'good',
    icon: '🤰',
  };

  const _chart = {
    type: 'bar',
    bars: [
      { label: 'Subsidio prenatal (49 días)', value: Math.round(subsidioPrenatal) },
      { label: `Subsidio postnatal (${diasPostnatal} días)`, value: Math.round(subsidioPostnatal) },
    ].filter((b) => b.value > 0),
    prefix: 'S/ ',
    ariaLabel: `Subsidio por maternidad de ${fmtPEN(subsidioTotal)} repartido entre prenatal y postnatal.`,
  };

  return {
    subsidioTotal: fmtPEN(subsidioTotal),
    diasTotales: `${diasTotales} días`,
    desglosaDias: `${diasPrenatal} prenatal + ${diasPostnatal} postnatal`,
    remuneracionDiaria: fmtPEN(remDiaria),
    subsidioMensual: fmtPEN(subsidioMensual),
    equivalenteSueldos: `${equivalenteSueldos.toFixed(1)} sueldos`,
    topeCas: esCas
      ? 'Sin tope en 2026: la base imponible CAS de EsSalud se homologó al 100% del ingreso mensual, así que el subsidio se calcula sobre tu remuneración completa (el viejo tope de 30% UIT quedó derogado).'
      : 'No aplica (régimen privado, sin tope).',
    detalle: `(${fmtPEN(rem)} × 12 ÷ 360) × ${diasTotales} días = ${fmtPEN(subsidioTotal)}`,
    _insight,
    _chart,
  };
}
