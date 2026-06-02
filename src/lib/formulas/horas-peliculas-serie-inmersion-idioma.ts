export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function horasPeliculasSerieInmersionIdioma(i: Inputs): Outputs {
  const h=Number(i.horasEstudio)||0;
  const v=h*0.3;
  const _insight = {
    title: 'Cuánto video inmersivo sumar',
    text: `Con **${h}h** de estudio formal por semana, conviene agregar **${v.toFixed(1)}h** de series o películas en el idioma (subtítulos como apoyo, no muleta). Es un complemento de input comprensible, no un reemplazo del estudio estructurado.`,
    tone: 'neutral' as const,
    icon: '🎬',
  };
  return { horasMedia:`${v.toFixed(1)}h/sem`, modoRec:'Serie con sub objetivo', resumen:`${h}h estudio → ${v.toFixed(1)}h video inmersivo.`, _insight };
}
