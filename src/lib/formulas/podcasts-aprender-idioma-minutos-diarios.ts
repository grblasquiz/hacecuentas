export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function podcastsAprenderIdiomaMinutosDiarios(i: Inputs): Outputs {
  const n=String(i.nivel||'a1');
  const p:Record<string,[string,string]>={a1:['15 min','Para principiantes absolutos'],a2:['20 min','Graded, transcripción'],b1:['30 min','Graded sin transcripción'],b2:['30-45 min','Nativos lentos'],c1:['45+ min','Nativos normales']};
  const [m,t]=p[n]||p.a1;
  return { minDia:m, tipo:t, resumen:`${n.toUpperCase()}: ${m}/día. ${t}.` };
}
