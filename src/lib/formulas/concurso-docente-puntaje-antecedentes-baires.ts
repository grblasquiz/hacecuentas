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
    },
  } as const)[__lang];
  const t=Number(i.titulos)||0; const a=Number(i.antiguedad)||0; const p=Number(i.publicaciones)||0; const c=Number(i.cursos)||0;
  const tot=t+a+p+c;
  let n='', rec='';
  if(tot>=80){n=T.alto;rec=T.muyCompetitivo}
  else if(tot>=50){n=T.medio;rec=T.competitivo}
  else if(tot>=30){n=T.basico;rec=T.sumaAntiguedad}
  else {n=T.inicial;rec=T.sumaFormacion}
  return { puntajeTotal:T.puntos(tot), nivelAproximado:n, recomendacion:rec };
}
