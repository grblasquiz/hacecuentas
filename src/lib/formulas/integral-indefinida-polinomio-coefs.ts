export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function integralIndefinidaPolinomioCoefs(i: Inputs): Outputs {
  const __lang = i.__lang === 'pt' ? 'pt' : 'es';
  const T = ({
    es: {
      empty: 'Ingresá coeficientes.',
      insTitle: 'Tu integral indefinida',
      insText: (terms: string, gr: number) => `Integraste un polinomio de grado **${gr}**; subiste cada término un grado y dividiste por el nuevo exponente: **∫ = ${terms}**. No olvides la constante **+ C**: representa infinitas primitivas paralelas.`,
    },
    pt: {
      empty: 'Insira os coeficientes.',
      insTitle: 'Sua integral indefinida',
      insText: (terms: string, gr: number) => `Você integrou um polinômio de grau **${gr}**; subiu cada termo um grau e dividiu pelo novo expoente: **∫ = ${terms}**. Não esqueça a constante **+ C**: representa infinitas primitivas paralelas.`,
    },
  } as const)[__lang];
  const s=String(i.coefs||''); const cs=s.split(',').map(x=>Number(x.trim())).filter(x=>!isNaN(x));
  if (cs.length===0) return { integral:'—', resumen: T.empty };
  const n=cs.length-1;
  const terms=cs.map((c,k)=>{ const exp=n-k+1; const nc=c/exp; if (nc===0) return ''; const sign=nc<0?'-':(k===0?'':'+'); return `${sign}${Math.abs(nc).toFixed(2)}x^${exp}`; }).filter(Boolean).join('')+' + C';
  return {
    integral:terms,
    resumen:`∫ = ${terms}.`,
    _insight: {
      title: T.insTitle,
      text: T.insText(terms, n),
      tone: 'neutral',
      icon: '∫',
    },
  };
}
