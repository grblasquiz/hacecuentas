export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
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
  return { contieneTacc:d.t, ppm:`${d.p}${typeof d.p==='number'?' ppm':''}`, alternativa:d.alt };
}
