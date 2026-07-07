export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function padelRankingPuntosAptAapSubir(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const T = ({
    es: { puntos: 'puntos', torneosLabel: 'torneos al año', observacion: 'Sumatoria mejores 10 resultados.',
      insTitle: 'Cuánto te falta para subir', insIcon: '🎾',
      insText: (p:number,t:number,c:string)=>`Para dejar **${c}** necesitás **${p} puntos** sumando tus **mejores 10 resultados**, jugando al menos **${t} torneos al año**.` },
    en: { puntos: 'points', torneosLabel: 'tournaments per year', observacion: 'Sum of best 10 results.',
      insTitle: 'How far you are from moving up', insIcon: '🎾',
      insText: (p:number,t:number,c:string)=>`To leave **${c}** you need **${p} points** from your **best 10 results**, playing at least **${t} tournaments per year**.` },
    pt: { puntos: 'pontos', torneosLabel: 'torneios por ano', observacion: 'Soma dos 10 melhores resultados.',
      insTitle: 'Quanto falta para subir', insIcon: '🎾',
      insText: (p:number,t:number,c:string)=>`Para sair de **${c}** você precisa de **${p} pontos** somando seus **10 melhores resultados**, jogando ao menos **${t} torneios por ano**.` },
  } as const)[__lang];
  const cLabels = ({
    es: {septima:'séptima',sexta:'sexta',quinta:'quinta',cuarta:'cuarta',tercera:'tercera',segunda:'segunda',primera:'primera'},
    en: {septima:'7th',sexta:'6th',quinta:'5th',cuarta:'4th',tercera:'3rd',segunda:'2nd',primera:'1st'},
    pt: {septima:'sétima',sexta:'sexta',quinta:'quinta',cuarta:'quarta',tercera:'terceira',segunda:'segunda',primera:'primeira'},
  } as const)[__lang] as Record<string,string>;
  const c=String(i.categoriaActual||'sexta');
  const pts={'septima':300,'sexta':500,'quinta':800,'cuarta':1200,'tercera':1800,'segunda':2500,'primera':3500}[c];
  const tor={'septima':6,'sexta':8,'quinta':10,'cuarta':12,'tercera':14,'segunda':16,'primera':20}[c];
  const catLabel = cLabels[c] || c;
  return {
    puntosSubir:`${pts} ${T.puntos}`,
    torneosMinimos:`${tor}+ ${T.torneosLabel}`,
    observacion: T.observacion,
    _insight: { title: T.insTitle, text: T.insText(pts as number, tor as number, catLabel), tone: 'neutral', icon: T.insIcon },
  };
}
