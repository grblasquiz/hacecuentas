export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function concursoDocentePuntajeAntecedentesBaires(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      alto: 'Alto',
      muyCompetitivo: 'Muy competitivo',
      medio: 'Medio',
      competitivo: 'Competitivo',
      basico: 'Básico',
      sumaAntiguedad: 'Sumá cursos y antigüedad',
      inicial: 'Inicial',
      sumaFormacion: 'Suma formación',
      puntos: (tot: number) => `${tot} puntos`,
      insTitle: 'Tu puntaje de antecedentes',
      insText: (tot: number, n: string, rec: string) =>
        `Sumás **${tot} puntos** (nivel **${n}**). ${rec}.`,
      chartMarker: 'Tu puntaje',
      segInicial: 'Inicial',
      segBasico: 'Básico',
      segMedio: 'Medio',
      segAlto: 'Alto',
      chartAria: (tot: number) => `Tu puntaje de antecedentes es ${tot} sobre la escala del concurso docente`,
    },
    en: {
      alto: 'High',
      muyCompetitivo: 'Very competitive',
      medio: 'Medium',
      competitivo: 'Competitive',
      basico: 'Basic',
      sumaAntiguedad: 'Add courses and seniority',
      inicial: 'Initial',
      sumaFormacion: 'Add qualifications',
      puntos: (tot: number) => `${tot} points`,
      insTitle: 'Your background score',
      insText: (tot: number, n: string, rec: string) =>
        `You add up **${tot} points** (**${n}** level). ${rec}.`,
      chartMarker: 'Your score',
      segInicial: 'Initial',
      segBasico: 'Basic',
      segMedio: 'Medium',
      segAlto: 'High',
      chartAria: (tot: number) => `Your background score is ${tot} on the teaching contest scale`,
    },
  } as const)[__lang];
  const t=Number(i.titulos)||0; const a=Number(i.antiguedad)||0; const p=Number(i.publicaciones)||0; const c=Number(i.cursos)||0;
  const tot=t+a+p+c;
  let n='', rec='';
  if(tot>=80){n=T.alto;rec=T.muyCompetitivo}
  else if(tot>=50){n=T.medio;rec=T.competitivo}
  else if(tot>=30){n=T.basico;rec=T.sumaAntiguedad}
  else {n=T.inicial;rec=T.sumaFormacion}
  const tone = tot>=80 ? 'good' : tot<30 ? 'warn' : 'neutral';
  const _insight = {
    title: T.insTitle,
    text: T.insText(tot, n, rec),
    tone,
    icon: '🎓',
  };
  const topMax = Math.max(100, tot + 10);
  const _chart = {
    type: 'scale',
    marker: tot,
    markerLabel: T.chartMarker,
    min: 0,
    segments: [
      { nombre: T.segInicial, max: 30, color: '#f97316', colorDark: '#fb923c' },
      { nombre: T.segBasico, max: 50, color: '#eab308', colorDark: '#facc15' },
      { nombre: T.segMedio, max: 80, color: '#3b82f6', colorDark: '#60a5fa' },
      { nombre: T.segAlto, max: topMax, color: '#22c55e', colorDark: '#4ade80' },
    ],
    ariaLabel: T.chartAria(tot),
  };
  return { puntajeTotal:T.puntos(tot), nivelAproximado:n, recomendacion:rec, _insight, _chart } as Outputs;
}
