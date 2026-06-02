export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function mesadaSemanalHijoEdadSugeridaMonto(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const T = ({
    es: {
      proposito: 'Educación financiera desde temprano. 10-20% ahorro obligatorio.',
      ins_title: 'Mesada sugerida',
      ins_text: (e: number, s: string, m: string) => `A los **${e} años** la mesada sugerida es de **${s}/semana** (≈ **${m}/mes**). Pedile que aparte un **10-20% para ahorro**: es la mejor forma de enseñar educación financiera desde temprano.`,
    },
    en: {
      proposito: 'Financial education from an early age. 10-20% mandatory savings.',
      ins_title: 'Suggested allowance',
      ins_text: (e: number, s: string, m: string) => `At **${e} years old** the suggested allowance is **${s}/week** (≈ **${m}/month**). Have them set aside **10-20% for savings**: the best way to teach financial education early on.`,
    },
    pt: {
      proposito: 'Educação financeira desde cedo. 10-20% de poupança obrigatória.',
      ins_title: 'Mesada sugerida',
      ins_text: (e: number, s: string, m: string) => `Aos **${e} anos** a mesada sugerida é de **${s}/semana** (≈ **${m}/mês**). Peça que separe **10-20% para poupança**: a melhor forma de ensinar educação financeira desde cedo.`,
    },
  } as const)[__lang];
  const e=Number(i.edad)||0; const n=String(i.nivelVida||'medio');
  const mult={'basico':1,'medio':2,'alto':4}[n];
  const sem=e*1000*mult;
  const mes=sem*4.33;
  const semFmt=`$${Math.round(sem).toLocaleString('es-AR')}`;
  const mesFmt=`$${Math.round(mes).toLocaleString('es-AR')}`;
  const _insight = {
    title: T.ins_title,
    text: T.ins_text(e, semFmt, mesFmt),
    tone: 'neutral',
    icon: '🐷',
  };
  return { mesadaSemanal:semFmt, mensualEquivalente:mesFmt, proposito: T.proposito, _insight };
}
