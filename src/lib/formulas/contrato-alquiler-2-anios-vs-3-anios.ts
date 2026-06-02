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
  const plazoLabel = p === '2a' ? (__lang === 'es' ? '2 años' : '2y')
    : p === '3a' ? (__lang === 'es' ? '3 años' : '3y')
    : (__lang === 'en' ? 'free term' : __lang === 'pt' ? 'prazo livre' : 'plazo libre');
  const insightText = __lang === 'en'
    ? `A **${plazoLabel}** lease means **${vEn.toLowerCase()}**. Guarantee: **${gEn}**; updates: **${aEn}**. Match the term to how long you plan to stay.`
    : __lang === 'pt'
    ? `Um contrato de **${plazoLabel}** implica **${vPt.toLowerCase()}**. Garantia: **${gPt}**; reajuste: **${aPt}**. Ajuste o prazo ao tempo que pretende ficar.`
    : `Un contrato a **${plazoLabel}** implica **${v.toLowerCase()}**. Garantía: **${g}**; actualización: **${a}**. Elegí el plazo según cuánto pensás quedarte.`;
  return { garantia, actualizacion, ventajas, resumen,
    _insight: {
      title: __lang === 'en' ? 'What this term implies' : __lang === 'pt' ? 'O que esse prazo implica' : 'Qué implica este plazo',
      text: insightText,
      tone: 'neutral',
      icon: '🏠',
    },
  };
}
