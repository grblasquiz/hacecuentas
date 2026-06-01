export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function contratoAlquiler2AniosVs3Anios(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const p=String(i.plazo||'3a');
  const info: Record<string,[string,string,string,string,string,string,string,string,string]> = {
    '2a':[
      'Propietaria o seguro','Pactado (ICL/USD)','Plazo más corto, más flexibilidad',
      'Owner or insurance','Agreed (ICL/USD)','Shorter term, more flexibility',
      'Proprietária ou seguro','Acordado (índice/USD)','Prazo mais curto, mais flexibilidade'
    ],
    '3a':[
      'Propietaria o seguro','Anual ICL o pactado','Estabilidad mayor',
      'Owner or insurance','Annual ICL or agreed','Greater stability',
      'Proprietária ou seguro','Anual por índice ou acordado','Maior estabilidade'
    ],
    libre:[
      'Negociable','Libre (mensual/sem/anual)','Máxima flexibilidad bilateral',
      'Negotiable','Free (monthly/biweekly/annual)','Maximum bilateral flexibility',
      'Negociável','Livre (mensal/quinzenal/anual)','Máxima flexibilidade bilateral'
    ]
  };
  const row=info[p]||info['3a'];
  const [g,a,v,gEn,aEn,vEn,gPt,aPt,vPt]=row;
  const garantia   = __lang === 'en' ? gEn : __lang === 'pt' ? gPt : g;
  const actualizacion = __lang === 'en' ? aEn : __lang === 'pt' ? aPt : a;
  const ventajas   = __lang === 'en' ? vEn : __lang === 'pt' ? vPt : v;
  const resumen    = __lang === 'en'
    ? `Contract ${p}: ${vEn}.`
    : __lang === 'pt'
    ? `Contrato ${p}: ${vPt}.`
    : `Contrato ${p}: ${v}.`;
  return { garantia, actualizacion, ventajas, resumen };
}
