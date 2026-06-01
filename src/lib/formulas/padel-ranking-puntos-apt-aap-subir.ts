export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function padelRankingPuntosAptAapSubir(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: { puntos: 'puntos', torneosLabel: 'torneos al año', observacion: 'Sumatoria mejores 10 resultados.' },
    en: { puntos: 'points', torneosLabel: 'tournaments per year', observacion: 'Sum of best 10 results.' },
  } as const)[__lang];
  const c=String(i.categoriaActual||'sexta');
  const pts={'septima':300,'sexta':500,'quinta':800,'cuarta':1200,'tercera':1800,'segunda':2500,'primera':3500}[c];
  const tor={'septima':6,'sexta':8,'quinta':10,'cuarta':12,'tercera':14,'segunda':16,'primera':20}[c];
  return { puntosSubir:`${pts} ${T.puntos}`, torneosMinimos:`${tor}+ ${T.torneosLabel}`, observacion: T.observacion };
}
