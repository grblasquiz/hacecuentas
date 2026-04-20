export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function padelRankingPuntosAptAapSubir(i: Inputs): Outputs {
  const c=String(i.categoriaActual||'sexta');
  const pts={'septima':300,'sexta':500,'quinta':800,'cuarta':1200,'tercera':1800,'segunda':2500,'primera':3500}[c];
  const tor={'septima':6,'sexta':8,'quinta':10,'cuarta':12,'tercera':14,'segunda':16,'primera':20}[c];
  return { puntosSubir:`${pts} puntos`, torneosMinimos:`${tor}+ torneos al año`, observacion:'Sumatoria mejores 10 resultados.' };
}
