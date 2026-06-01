export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function actividadesExtraNinosPorSemanaMaximo(i: Inputs): Outputs {
  const e=Number(i.edad)||0;
  let max:string; let tl:string; let etapa:string;
  if (e<5) { max='0-1'; tl='180+ min'; etapa='En preescolar el juego no estructurado es la actividad principal: una sola extra ya alcanza.'; }
  else if (e<10) { max='2-3'; tl='120 min'; etapa='A esta edad dos o tres actividades cubren deporte y arte sin saturar la semana.'; }
  else { max='3-5'; tl='60-90 min'; etapa='Ya tolera hasta cinco actividades, pero cuidá que sigan quedando tardes libres para descansar.'; }
  const _insight = {
    title: 'Cuántas extras sin saturar',
    text: `Para **${e} año${e===1?'':'s'}**, un máximo de **${max} actividades** por semana y al menos **${tl} de juego libre** por día. ${etapa}`,
    tone: 'neutral',
    icon: '🧒',
  };
  return { maxSemanal:max, tiempoLibre:tl, resumen:`Edad ${e}: máx ${max} actividades, juego libre ${tl}/día.`, _insight };
}
