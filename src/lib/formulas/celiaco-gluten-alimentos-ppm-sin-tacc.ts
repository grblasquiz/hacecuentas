export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function celiacoGlutenAlimentosPpmSinTacc(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const a=String(i.alimento||'arroz');
  const T = ({
    es: {
      si: 'Sí',
      no: 'No',
      posible: 'Posible (contam.)',
      noNatural: 'No (natural)',
      altHarinaTrigo: 'Harina de arroz, mandioca, almendra',
      altNone: '—',
      altCebada: 'Arroz, mijo',
      altAvena: 'Avena certificada sin TACC',
      altYogur: 'Verificar marcas',
      insTitleSi: 'Contiene gluten',
      insTitlePosible: 'Riesgo de contaminación',
      insTitleNo: 'Apto sin TACC',
      insSi: (p:string,alt:string)=>`Este alimento aporta gluten (**${p}**), muy por encima del límite seguro de **20 ppm**. No es apto para celíacos: reemplazalo por ${alt.toLowerCase()}.`,
      insPosible: (p:string,alt:string)=>`Puede estar contaminado con trazas (**${p} ppm**). El umbral seguro es **20 ppm**: consumilo sólo si es ${alt.toLowerCase()}.`,
      insNo: ()=>`Es naturalmente **libre de gluten** (por debajo de **20 ppm**, el límite legal "sin TACC"). Apto para celíacos.`,
    },
    en: {
      si: 'Yes',
      no: 'No',
      posible: 'Possible (contam.)',
      noNatural: 'No (natural)',
      altHarinaTrigo: 'Rice flour, cassava, almond flour',
      altNone: '—',
      altCebada: 'Rice, millet',
      altAvena: 'Certified gluten-free oats',
      altYogur: 'Check brand labels',
      insTitleSi: 'Contains gluten',
      insTitlePosible: 'Cross-contamination risk',
      insTitleNo: 'Gluten-free',
      insSi: (p:string,alt:string)=>`This food contains gluten (**${p}**), far above the safe limit of **20 ppm**. Not safe for celiacs: replace it with ${alt.toLowerCase()}.`,
      insPosible: (p:string,alt:string)=>`It may carry trace contamination (**${p} ppm**). The safe threshold is **20 ppm**: only eat it if it's ${alt.toLowerCase()}.`,
      insNo: ()=>`It is naturally **gluten-free** (below **20 ppm**, the legal "gluten-free" limit). Safe for celiacs.`,
    },
  } as const)[__lang];
  const data={
    'harina_trigo':{t:T.si,p:30000,alt:T.altHarinaTrigo},
    'arroz':{t:T.no,p:0,alt:T.altNone},
    'maiz':{t:T.no,p:0,alt:T.altNone},
    'cebada':{t:T.si,p:25000,alt:T.altCebada},
    'avena':{t:T.posible,p:'100-300',alt:T.altAvena},
    'quinoa':{t:T.no,p:0,alt:T.altNone},
    'papa':{t:T.no,p:0,alt:T.altNone},
    'queso_duro':{t:T.no,p:0,alt:T.altNone},
    'yogur':{t:T.noNatural,p:'<20',alt:T.altYogur}
  };
  const d=data[a];
  const ppmStr = `${d.p}${typeof d.p==='number'?' ppm':''}`;
  let _insight: any;
  if (d.t === T.si) {
    _insight = { title: T.insTitleSi, text: T.insSi(ppmStr, d.alt), tone: 'warn', icon: '🚫' };
  } else if (d.t === T.posible) {
    _insight = { title: T.insTitlePosible, text: T.insPosible(String(d.p), d.alt), tone: 'warn', icon: '⚠️' };
  } else {
    _insight = { title: T.insTitleNo, text: T.insNo(), tone: 'good', icon: '✅' };
  }
  return { contieneTacc:d.t, ppm:ppmStr, alternativa:d.alt, _insight };
}
