/**
 * Costo del pasaporte electrónico peruano — 2026 (Migraciones).
 * Tasa única: S/ 120,90 por persona, a cualquier edad (código de pago 01810,
 * vía Págalo.pe, Yape, Banco de la Nación o POS en sede).
 * Vigencia: mayores de edad 10 años (Ley 31678) · 12-17 años: 5 años · menores de 12: 3 años.
 * Desde mayo 2026 el trámite es SIN cita (orden de llegada) y la sede del aeropuerto
 * Jorge Chávez atiende 24/7.
 * Fuente: Migraciones / gob.pe. Verificado 2026-07-18.
 */
import { PASAPORTE_PERU_2026, fmtPEN2 } from '../data/peru-2026.ts';

export interface Inputs {
  adultos?: number | string;    // pasaportes para mayores de 18
  menores12a17?: number | string;
  menores12?: number | string;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const adultos = Math.max(0, Math.min(20, Math.floor(Number(i.adultos) || 0)));
  const de12a17 = Math.max(0, Math.min(20, Math.floor(Number(i.menores12a17) || 0)));
  const menores12 = Math.max(0, Math.min(20, Math.floor(Number(i.menores12) || 0)));
  const personas = adultos + de12a17 + menores12;
  const { tasa, vigenciaAnios } = PASAPORTE_PERU_2026;

  if (personas === 0) throw new Error('Indica cuántos pasaportes vas a tramitar.');

  const total = tasa * personas;
  const costoAnualAdulto = tasa / vigenciaAnios.adulto;

  const _insight = {
    title: personas > 1 ? `${personas} pasaportes: ${fmtPEN2(total)}` : `Tu pasaporte: ${fmtPEN2(total)}`,
    text: `La tasa es **${fmtPEN2(tasa)} por persona a cualquier edad**: ${personas} pasaporte(s) = **${fmtPEN2(total)}**. La diferencia está en la vigencia: adultos **10 años** (sale ${fmtPEN2(costoAnualAdulto)} por año), de 12 a 17 años **5 años**, y menores de 12 **3 años** — los de los niños se renuevan más seguido. Paga con el código **01810** en Págalo.pe o Yape antes de ir; desde mayo 2026 no se necesita cita.`,
    tone: 'neutral',
    icon: '🛂',
  };

  const _chart = {
    type: 'bar' as const,
    labels: ['Adulto (10 años)', '12-17 años (5 años)', 'Menor de 12 (3 años)'],
    values: [
      Math.round(costoAnualAdulto * 100) / 100,
      Math.round((tasa / vigenciaAnios.de12a17) * 100) / 100,
      Math.round((tasa / vigenciaAnios.menor12) * 100) / 100,
    ],
    prefix: 'S/ ',
    ariaLabel: 'Costo por año de vigencia según la edad: la misma tasa dura 10, 5 o 3 años.',
  };

  return {
    total: fmtPEN2(total),
    tasaPorPersona: `${fmtPEN2(tasa)} (misma tasa a toda edad)`,
    costoPorAnio: `Adulto: ${fmtPEN2(costoAnualAdulto)}/año de vigencia`,
    detalle: `${personas} pasaporte(s) × ${fmtPEN2(tasa)} = ${fmtPEN2(total)}. Vigencias: ${adultos} adulto(s) × 10 años, ${de12a17} de 12-17 × 5 años, ${menores12} menor(es) de 12 × 3 años.`,
    _insight,
    _chart,
  };
}
