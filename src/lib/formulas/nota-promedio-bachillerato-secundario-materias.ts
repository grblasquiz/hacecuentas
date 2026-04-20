export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function notaPromedioBachilleratoSecundarioMaterias(i: Inputs): Outputs {
  const t=String(i.notasTexto||'').split(',').map(x=>Number(x.trim())).filter(n=>!isNaN(n));
  if(t.length===0) return { promedio:'—', clasificacion:'—', materiasAprobadas:'—' };
  const prom=t.reduce((a,b)=>a+b,0)/t.length;
  const aprob=t.filter(n=>n>=4).length;
  let clas='';
  if(prom>=9) clas='Excelente';
  else if(prom>=7) clas='Muy bueno';
  else if(prom>=6) clas='Bueno';
  else if(prom>=4) clas='Aprobado';
  else clas='Desaprobado';
  return { promedio:prom.toFixed(2), clasificacion:clas, materiasAprobadas:`${aprob}/${t.length}` };
}
