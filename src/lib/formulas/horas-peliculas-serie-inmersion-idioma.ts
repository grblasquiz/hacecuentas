/** Horas de pelis/series como input comprensible → horas de estudio activo equivalentes */
export interface Inputs { horasVideo?: number | string; factor?: number | string; __lang?: string; [k: string]: number | string | undefined; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

export function horasPeliculasSerieInmersionIdioma(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const es = __lang === 'es';

  // Horas de video/semana (input comprensible pasivo)
  const horasVideo = Math.max(0, Number(i.horasVideo) || 0);

  // Factor de eficiencia: 1 h de input pasivo (pelis/series) ≈ 0,3–0,5 h de estudio activo.
  // Default 0,4, editable. Acotado a un rango razonable [0,1 ; 1].
  let factor = Number(i.factor);
  if (!Number.isFinite(factor) || factor <= 0) factor = 0.4;
  factor = Math.min(1, Math.max(0.1, factor));

  // Horas de estudio activo equivalentes por semana
  const equivSemana = horasVideo * factor;
  // Proyección mensual (4,33 semanas promedio por mes)
  const SEMANAS_MES = 4.33;
  const videoMes = horasVideo * SEMANAS_MES;
  const equivMes = equivSemana * SEMANAS_MES;

  const fmt = (n: number) => Number(n.toFixed(1));
  const pct = Math.round(factor * 100);

  const _insight = {
    title: es ? 'Tu input comprensible en horas de estudio' : 'Your comprehensible input in study hours',
    text: es
      ? `**${fmt(horasVideo)} h** de series/películas por semana rinden como **${fmt(equivSemana)} h** de estudio activo (factor ${factor}, ≈${pct} %). En un mes son **${fmt(equivMes)} h** equivalentes. Es una estimación basada en la hipótesis del input comprensible: el video es un complemento, no un reemplazo del estudio estructurado.`
      : `**${fmt(horasVideo)} h** of movies/series per week count as about **${fmt(equivSemana)} h** of active study (factor ${factor}, ≈${pct}%). Over a month that's **${fmt(equivMes)} h** equivalent. This is an estimate based on the comprehensible-input hypothesis: video supplements, it does not replace, structured study.`,
    tone: 'neutral' as const,
    icon: '🎬',
  };

  return {
    equivEstudio: es ? `${fmt(equivSemana)} h/sem` : `${fmt(equivSemana)} h/wk`,
    equivMensual: es ? `${fmt(equivMes)} h/mes` : `${fmt(equivMes)} h/mo`,
    videoMensual: es ? `${fmt(videoMes)} h/mes de video` : `${fmt(videoMes)} h/mo of video`,
    resumen: es
      ? `${fmt(horasVideo)} h video/sem × ${factor} = ${fmt(equivSemana)} h estudio equiv. (estimación, input comprensible).`
      : `${fmt(horasVideo)} h video/wk × ${factor} = ${fmt(equivSemana)} h equivalent study (estimate, comprehensible input).`,
    _insight,
  };
}
