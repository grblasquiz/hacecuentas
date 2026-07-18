/** NEM y Ranking DEMRE (Proceso de Admisión 2026) — Chile.
 *  Convierte el promedio de notas de enseñanza media (4,0–7,0) a puntaje NEM
 *  (escala 100–1000) usando las tablas oficiales DEMRE por grupo (A: HC diurna,
 *  B: HC adultos, C: Técnico-Profesional), y estima el Puntaje Ranking con la
 *  fórmula oficial: R = NEM + (1000 − NEM) × (NEM − PROM) ÷ (MAX − PROM).
 *  Fuente: demre.cl (tablas y método en data/chile-2026.ts → NEM_DEMRE_2026). */
import { NEM_DEMRE_2026 } from '../data/chile-2026.ts';

export interface Inputs {
  promedio: number;      // promedio de notas 1° a 4° medio (4,0 a 7,0)
  grupo: string;         // 'A' | 'B' | 'C'
  promedioColegio?: number; // PROM: promedio de las 3 generaciones anteriores del colegio (opcional)
  maximoColegio?: number;   // MAX: nota máxima de esas generaciones (opcional)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

function notaAPuntaje(nota: number, grupo: 'A' | 'B' | 'C'): number {
  const idx = Math.min(300, Math.max(0, Math.round(nota * 100) - 400));
  return NEM_DEMRE_2026[grupo][idx];
}

export function compute(i: Inputs): Outputs {
  const promedio = Number(i.promedio) || 0;
  const grupo = (['A', 'B', 'C'].includes(i.grupo) ? i.grupo : 'A') as 'A' | 'B' | 'C';
  const prom = Number(i.promedioColegio) || 0;
  const max = Number(i.maximoColegio) || 0;

  if (promedio < 4 || promedio > 7) throw new Error('El promedio debe estar entre 4,0 y 7,0 (bajo 4,0 no hay puntaje NEM)');

  const nemPts = notaAPuntaje(promedio, grupo);
  const grupoNombre = grupo === 'A' ? 'Humanístico-Científica diurna' : grupo === 'B' ? 'HC de adultos (vespertina/nocturna)' : 'Técnico-Profesional';

  // Ranking estimado (fórmula oficial DEMRE, aplicada de forma agregada con los
  // datos del colegio si se ingresan; el cálculo oficial se hace nivel por nivel).
  let rankingTxt = 'Ingresá el promedio y la nota máxima de tu colegio para estimarlo (mínimo: igual a tu puntaje NEM)';
  let rankingPts: number | null = null;
  let rankingDetalle = '';
  if (prom > 0 && max > 0) {
    if (max < prom) throw new Error('La nota máxima del colegio no puede ser menor que su promedio');
    if (max > 7 || prom < 4) throw new Error('El promedio y máximo del colegio deben estar entre 4,0 y 7,0');
    const promPts = notaAPuntaje(prom, grupo);
    const maxPts = notaAPuntaje(max, grupo);
    if (nemPts <= promPts) {
      rankingPts = nemPts;
      rankingDetalle = `Tu NEM (${nemPts}) ≤ PROM del colegio (${promPts}) → Ranking = puntaje NEM.`;
    } else if (nemPts >= maxPts) {
      rankingPts = 1000;
      rankingDetalle = `Tu NEM (${nemPts}) ≥ MAX del colegio (${maxPts}) → Ranking = 1000.`;
    } else {
      rankingPts = Math.round(nemPts + (1000 - nemPts) * (nemPts - promPts) / (maxPts - promPts));
      rankingDetalle = `R = ${nemPts} + (1000 − ${nemPts}) × (${nemPts} − ${promPts}) ÷ (${maxPts} − ${promPts}) = ${rankingPts}.`;
    }
    rankingTxt = `${rankingPts} puntos (estimado)`;
  }

  const _insight = {
    title: 'Tu puntaje NEM 2026',
    text: `Un promedio de **${promedio.toLocaleString('es-CL', { minimumFractionDigits: 2 })}** en la rama **${grupoNombre}** equivale a **${nemPts} puntos NEM** en la escala 100–1000 del DEMRE.${rankingPts !== null ? ` Comparado con tu colegio, tu Puntaje Ranking estimado es **${rankingPts}**${rankingPts > nemPts ? ` (+${rankingPts - nemPts} puntos sobre tu NEM por estar sobre el promedio histórico)` : ''}.` : ' El Ranking parte igual a tu NEM y solo sube si superás el promedio histórico de tu colegio.'}`,
    tone: 'neutral',
    icon: '📚',
  };
  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Puntaje NEM', value: nemPts },
      ...(rankingPts !== null ? [{ label: 'Ranking estimado', value: rankingPts }] : []),
    ],
    ariaLabel: `Puntaje NEM ${nemPts}${rankingPts !== null ? `, ranking estimado ${rankingPts}` : ''} sobre un máximo de 1000.`,
  };

  return {
    puntajeNem: `${nemPts} puntos`,
    puntajeRanking: rankingTxt,
    grupoAplicado: `Grupo ${grupo} — ${grupoNombre}`,
    detalle: `Conversión con la tabla oficial DEMRE del Proceso de Admisión 2026 (grupo ${grupo}): promedio ${promedio.toLocaleString('es-CL', { minimumFractionDigits: 2 })} → ${nemPts} puntos. ${rankingDetalle ? 'Ranking: ' + rankingDetalle + ' El cálculo oficial se hace por separado para cada nivel (R1 a R4) con las 3 generaciones anteriores de tu colegio; esta es una estimación agregada.' : 'El Ranking oficial compara tus notas nivel por nivel (R1–R4) con las 3 generaciones anteriores de tu colegio: nunca es menor que tu NEM y llega a 1000 si igualás el máximo histórico.'}`,
    _insight,
    _chart,
  };
}
