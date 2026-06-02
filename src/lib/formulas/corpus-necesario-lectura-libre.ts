/** Corpus Necesario para Lectura Libre */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  corpusNecesario: number;
  gapPalabras: number;
  coberturaActual: number;
  recomendacion: string;
  _insight?: any;
  _chart?: any;
}

export function corpusNecesarioLecturaLibre(i: Inputs): Outputs {
  const tipo = String(i.tipoTexto || 'novela');
  const idioma = String(i.idioma || 'ingles');
  const act = Number(i.vocabActual) || 0;

  const CORPUS: Record<string, number> = {
    conversacion: 2800, 'novela-simple': 5500, novela: 8000,
    periodico: 9000, ensayo: 10500, academico: 14000, tecnico: 17000,
  };
  const AJUSTE: Record<string, number> = {
    ingles: 1.0, frances: 0.9, italiano: 0.9, portugues: 0.9,
    aleman: 1.2, japones: 1.3, chino: 1.5,
  };

  const base = CORPUS[tipo] || 8000;
  const adj = AJUSTE[idioma] || 1.0;
  const corpus = Math.round(base * adj);
  const gap = Math.max(0, corpus - act);
  const cob = Math.min(98, Math.round((act / corpus) * 98));

  let rec = '';
  if (gap === 0) rec = 'Ya tenés corpus para lectura libre cómoda.';
  else if (cob >= 90) rec = 'Muy cerca: arrancá ya con el texto y aprendé del contexto.';
  else if (cob >= 80) rec = 'Todavía lejos: elegí graded readers del nivel inmediato.';
  else rec = 'Lejos: enfocate en ampliar vocabulario antes de leer.';

  const fmtW = (n: number) => n.toLocaleString('es-AR');
  const tone = gap === 0 || cob >= 90 ? 'good' : cob < 80 ? 'warn' : 'neutral';
  const _insight = {
    title: gap === 0 ? 'Listo para lectura libre' : `Cobertura ${cob}%`,
    text: gap === 0
      ? `Con **${fmtW(act)}** palabras ya cubrís el corpus de **${fmtW(corpus)}** que pide este texto: podés leer de corrido y aprender del contexto.`
      : `Tu vocabulario cubre **${cob}%** del corpus necesario (**${fmtW(corpus)}** palabras). Te faltan **${fmtW(gap)}** palabras para leer cómodo. ${rec}`,
    tone,
    icon: '📚',
  };

  const _chart = {
    type: 'scale',
    marker: cob,
    markerLabel: cob + '%',
    min: 0,
    segments: [
      { nombre: 'Lejos', max: 80, color: '#ef4444', colorDark: '#dc2626' },
      { nombre: 'Cerca', max: 90, color: '#f59e0b', colorDark: '#d97706' },
      { nombre: 'Muy cerca', max: 98, color: '#84cc16', colorDark: '#65a30d' },
      { nombre: 'Listo', max: 100, color: '#22c55e', colorDark: '#16a34a' },
    ],
    ariaLabel: `Cobertura de vocabulario ${cob}% sobre el corpus necesario; por debajo de 80% conviene ampliar vocabulario antes de leer.`,
  };

  return {
    corpusNecesario: corpus,
    gapPalabras: gap,
    coberturaActual: cob,
    recomendacion: rec,
    _insight,
    _chart,
  };

}
