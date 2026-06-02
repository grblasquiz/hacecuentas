export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function librosLeerIdiomaNivelAnio(i: Inputs): Outputs {
  const n=String(i.nivel||'a1');
  const r:Record<string,[string,string]>={a1:['2-3','Graded readers nivel 1'],a2:['4-6','Graded readers 2-3'],b1:['5-8','Juvenil adaptado'],b2:['8-12','Young Adult, best-sellers'],c1:['12+','Literatura general'],c2:['20+','Clásicos, técnico']};
  const [lib,tp]=r[n]||r.a1;
  const _insight = {
    title: 'Plan de lectura',
    text: `En nivel **${n.toUpperCase()}** lo realista es leer **${lib} libros al año** del tipo "${tp}". Subir de nivel pasa por elegir textos cada vez más exigentes: la cantidad importa menos que la dificultad creciente.`,
    tone: 'neutral',
    icon: '📚',
  };
  return { librosAnio:lib, tipo:tp, resumen:`${n.toUpperCase()}: ${lib} libros/año. ${tp}.`, _insight };
}
