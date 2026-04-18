export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function librosLeerIdiomaNivelAnio(i: Inputs): Outputs {
  const n=String(i.nivel||'a1');
  const r:Record<string,[string,string]>={a1:['2-3','Graded readers nivel 1'],a2:['4-6','Graded readers 2-3'],b1:['5-8','Juvenil adaptado'],b2:['8-12','Young Adult, best-sellers'],c1:['12+','Literatura general'],c2:['20+','Clásicos, técnico']};
  const [lib,tp]=r[n]||r.a1;
  return { librosAnio:lib, tipo:tp, resumen:`${n.toUpperCase()}: ${lib} libros/año. ${tp}.` };
}
