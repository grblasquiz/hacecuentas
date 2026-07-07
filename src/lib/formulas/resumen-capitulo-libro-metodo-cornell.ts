export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Cornell Notes 5-R Study Time Calculator
 * Estimates time to complete Cornell note-taking cycle for book chapters.
 *
 * The 5-R system (Record, Reduce, Recite, Reflect, Review) adds ~7–10 min/page
 * versus plain reading (~2 min/page). Sources: Pauk & Owens "How to Study in
 * College" (2011), Dunlosky et al. "Improving Students' Learning" (2013).
 *
 * Per-page time by difficulty (minutes):
 *   Light  : Record 2.5 + Reduce 0.8 + Recite 1.0 + Reflect 0.7 + Review 0.5 = 5.5
 *   Standard: Record 3.5 + Reduce 1.2 + Recite 1.5 + Reflect 1.0 + Review 0.8 = 8.0
 *   Dense  : Record 5.0 + Reduce 1.8 + Recite 2.5 + Reflect 1.5 + Review 1.2 = 12.0
 */

const RATES: Record<string, Record<string, number>> = {
  light:    { record: 2.5, reduce: 0.8, recite: 1.0, reflect: 0.7, review: 0.5 },
  standard: { record: 3.5, reduce: 1.2, recite: 1.5, reflect: 1.0, review: 0.8 },
  dense:    { record: 5.0, reduce: 1.8, recite: 2.5, reflect: 1.5, review: 1.2 },
};

function fmtMin(totalMin: number, lang: 'en' | 'es' | 'pt'): string {
  const h = Math.floor(totalMin / 60);
  const m = Math.round(totalMin % 60);
  if (lang === 'es') {
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h} h`;
    return `${h} h ${m} min`;
  }
  if (lang === 'pt') {
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h} h`;
    return `${h} h ${m} min`;
  }
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export function resumenCapituloLibroMetodoCornell(i: Inputs): Outputs {
  const lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';

  const pages = Math.max(0, Number(i.pages) || Number(i.v1) || 0);
  const chapters = Math.max(1, Number(i.chapters) || Number(i.v2) || 1);
  const difficulty = (String(i.difficulty || 'standard')).toLowerCase();
  const rate = RATES[difficulty] || RATES.standard;

  const totalPages = pages * chapters;
  const recordMin  = totalPages * rate.record;
  const reduceMin  = totalPages * rate.reduce;
  const reciteMin  = totalPages * rate.recite;
  const reflectMin = totalPages * rate.reflect;
  const reviewMin  = totalPages * rate.review;
  const totalMin   = recordMin + reduceMin + reciteMin + reflectMin + reviewMin;

  // Per-chapter breakdown
  const perChapter = pages > 0 ? (totalMin / chapters) : 0;

  // Format outputs
  const totalFmt      = fmtMin(totalMin, lang);
  const perChapterFmt = fmtMin(perChapter, lang);
  const recordFmt     = fmtMin(recordMin, lang);
  const reciteFmt     = fmtMin(reciteMin, lang);
  const reviewFmt     = fmtMin(reviewMin, lang);

  // Human readable resultado
  const resultado = totalFmt;

  let resumen: string;
  let insightText: string;

  if (lang === 'en') {
    resumen = totalPages === 0
      ? 'Enter pages and chapters to estimate study time.'
      : `${totalPages} pages × ${(Object.values(rate).reduce((a, b) => a + b, 0)).toFixed(1)} min/page ≈ ${totalFmt} total (${perChapterFmt}/chapter). Record: ${recordFmt} · Recite: ${reciteFmt} · Review: ${reviewFmt}.`;
    insightText = `For **${totalPages} pages** using the Cornell 5-R method, plan **${totalFmt}** of focused study time (${perChapterFmt} per chapter). The biggest block is note-taking (Record: ${recordFmt}), followed by active recall (Recite: ${reciteFmt}) and spaced review (${reviewFmt}).`;
  } else if (lang === 'pt') {
    resumen = totalPages === 0
      ? 'Insira páginas e capítulos para estimar o tempo de estudo.'
      : `${totalPages} páginas × ${(Object.values(rate).reduce((a, b) => a + b, 0)).toFixed(1)} min/pág ≈ ${totalFmt} total (${perChapterFmt}/capítulo). Registrar: ${recordFmt} · Recitar: ${reciteFmt} · Revisar: ${reviewFmt}.`;
    insightText = `Para **${totalPages} páginas** com o método Cornell 5-R, preveja **${totalFmt}** de estudo focado (${perChapterFmt} por capítulo). O maior bloco é a tomada de notas (${recordFmt}), seguido da recordação ativa (${reciteFmt}) e revisão espaçada (${reviewFmt}).`;
  } else {
    resumen = totalPages === 0
      ? 'Ingresá páginas y capítulos para estimar el tiempo de estudio.'
      : `${totalPages} páginas × ${(Object.values(rate).reduce((a, b) => a + b, 0)).toFixed(1)} min/pág ≈ ${totalFmt} total (${perChapterFmt}/capítulo). Registrar: ${recordFmt} · Recitar: ${reciteFmt} · Revisar: ${reviewFmt}.`;
    insightText = `Para **${totalPages} páginas** con el método Cornell 5-R, planificá **${totalFmt}** de estudio concentrado (${perChapterFmt} por capítulo). El mayor bloque es la toma de notas (${recordFmt}), seguido del repaso activo (${reciteFmt}) y la revisión espaciada (${reviewFmt}).`;
  }

  const insight = {
    title: lang === 'en' ? 'Cornell Study Estimate' : lang === 'pt' ? 'Estimativa Cornell' : 'Estimación Cornell',
    text: insightText,
    tone: 'neutral',
    icon: '📓',
  };

  return { resultado, resumen, _insight: insight };
}
