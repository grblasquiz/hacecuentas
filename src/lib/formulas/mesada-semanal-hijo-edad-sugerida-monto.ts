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
      proposito: 'Financial education from an early age. Save 10–20% every week.',
      ins_title: 'Suggested allowance',
      ins_text: (e: number, s: string, m: string) => `At **${e} years old** the suggested allowance is **${s}/week** (≈ **${m}/month**). Have them set aside **10–20% for savings**: the best way to teach financial education early on.`,
    },
    pt: {
      proposito: 'Educação financeira desde cedo. Poupe 10-20% toda semana.',
      ins_title: 'Mesada sugerida',
      ins_text: (e: number, s: string, m: string) => `Aos **${e} anos** a mesada sugerida é de **${s}/semana** (≈ **${m}/mês**). Peça que separe **10-20% para poupança**: a melhor forma de ensinar educação financeira desde cedo.`,
    },
  } as const)[__lang];

  const e = Number(i.edad) || 0;
  const n = String(i.nivelVida || 'medio');

  let sem: number;
  let semFmt: string;
  let mesFmt: string;

  if (__lang === 'en') {
    // USD: standard US rule = $0.50 (basic) / $1.00 (moderate) / $1.50 (high) per year of age per week
    const rateUSD: { [k: string]: number } = { basico: 0.5, medio: 1.0, alto: 1.5 };
    sem = e * (rateUSD[n] ?? 1.0);
    const mes = sem * 4.33;
    semFmt = `$${sem.toFixed(2)}`;
    mesFmt = `$${mes.toFixed(2)}`;
  } else if (__lang === 'pt') {
    // BRL: ~R$5 (basic) / R$10 (moderate) / R$20 (high) per year of age per week
    const rateBRL: { [k: string]: number } = { basico: 5, medio: 10, alto: 20 };
    sem = e * (rateBRL[n] ?? 10);
    const mes = sem * 4.33;
    semFmt = `R$${Math.round(sem).toLocaleString('pt-BR')}`;
    mesFmt = `R$${Math.round(mes).toLocaleString('pt-BR')}`;
  } else {
    // ARS: $1.000 (basic) / $2.000 (moderate) / $4.000 (high) per year of age per week
    const mult: { [k: string]: number } = { basico: 1, medio: 2, alto: 4 };
    sem = e * 1000 * (mult[n] ?? 2);
    const mes = sem * 4.33;
    semFmt = `$${Math.round(sem).toLocaleString('es-AR')}`;
    mesFmt = `$${Math.round(mes).toLocaleString('es-AR')}`;
  }

  const _insight = {
    title: T.ins_title,
    text: T.ins_text(e, semFmt, mesFmt),
    tone: 'neutral',
    icon: '🐷',
  };
  return { mesadaSemanal: semFmt, mensualEquivalente: mesFmt, proposito: T.proposito, _insight };
}
