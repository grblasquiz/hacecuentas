export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function contratoAlquiler2AniosVs3Anios(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const p=String(i.plazo||'3a');
  const info: Record<string,[string,string,string,string,string,string]> = {
    '2a':[
      'Propietaria o seguro','Pactado (ICL/USD)','Plazo más corto, más flexibilidad',
      'Owner or insurance','Agreed (ICL/USD)','Shorter term, more flexibility'
    ],
    '3a':[
      'Propietaria o seguro','Anual ICL o pactado','Estabilidad mayor',
      'Owner or insurance','Annual ICL or agreed','Greater stability'
    ],
    libre:[
      'Negociable','Libre (mensual/sem/anual)','Máxima flexibilidad bilateral',
      'Negotiable','Free (monthly/biweekly/annual)','Maximum bilateral flexibility'
    ]
  };
  const row=info[p]||info['3a'];
  const [g,a,v,gEn,aEn,vEn]=row;
  const garantia   = __lang === 'en' ? gEn : g;
  const actualizacion = __lang === 'en' ? aEn : a;
  const ventajas   = __lang === 'en' ? vEn : v;
  const resumen    = __lang === 'en'
    ? `Contract ${p}: ${vEn}.`
    : `Contrato ${p}: ${v}.`;
  return { garantia, actualizacion, ventajas, resumen };
}
