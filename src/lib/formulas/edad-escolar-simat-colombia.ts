export interface Inputs { fecha_nacimiento:string; grado:string; fecha_corte:string; }
export interface Outputs { edad_anos:number; edad_meses:number; estado:string; orientacion:string; resumen:string; _insight?:any; }
export function compute(i:Inputs):Outputs {
  const parse=(s:string)=>{const p=String(s||'').split('-').map(Number); return p.length===3?new Date(p[0],p[1]-1,p[2]):null}; const nac=parse(i.fecha_nacimiento), corte=parse(i.fecha_corte)||new Date();
  if(!nac||isNaN(nac.getTime())||nac>corte) throw new Error('Ingresá una fecha de nacimiento válida.');
  let anos=corte.getFullYear()-nac.getFullYear(), meses=corte.getMonth()-nac.getMonth(); if(corte.getDate()<nac.getDate()) meses--; if(meses<0){anos--;meses+=12;}
  const min:{[k:string]:number}={preescolar:3,transicion:5,primaria:6,secundaria:11,media:14}; const requerido=min[i.grado]??0; const estado=anos>=requerido?'Edad orientativa cumplida':'Revisá el criterio de edad de tu secretaría';
  const orientacion=anos>=requerido?`Para ${i.grado}, cumple la edad orientativa de ${requerido} años al corte indicado.`:`Para ${i.grado}, faltan aproximadamente ${Math.max(0,requerido-anos)} año(s) respecto de la referencia orientativa.`;
  return {edad_anos:anos,edad_meses:meses,estado,orientacion,resumen:`Al ${corte.toLocaleDateString('es-CO')} tiene ${anos} años y ${meses} meses.`,_insight:{title:'Edad escolar al corte',text:`La edad calculada es **${anos} años y ${meses} meses**. ${orientacion} La asignación final la realiza la institución y la secretaría de educación en SIMAT.`,tone:'neutral',icon:'🎒'}};
}
