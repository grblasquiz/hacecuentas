export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function aguaCafeTeHidratacionRealMitos(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const c=Number(i.cafesDia)||0; const t=Number(i.taza_ml)||150;
  const totalMl=c*t;
  const hidratacion=totalMl*0.9;
  // Cafeína estimada: ~95 mg por taza de café filtrado. Límite seguro: 400 mg/día (~4 tazas).
  const cafeinaMg = Math.round(c * 95);
  const sobreLimite = cafeinaMg > 400;
  const T = ({
    es: {
      mito: 'Mito: café deshidrata. Realidad: hidrata ~90%. Solo efecto diurético leve.',
      recomendacion: 'Café cuenta como hidratación. Con moderación (<400 mg cafeína/día).',
      insightTitle: 'Tu café, ¿hidrata o no?',
      insightOk: `Tus **${c} taza${c === 1 ? '' : 's'}** suman **${Math.round(hidratacion)} mL** de hidratación neta y ~**${cafeinaMg} mg** de cafeína, dentro del límite seguro de 400 mg/día. El café SÍ cuenta como líquido.`,
      insightWarn: `Tus **${c} taza${c === 1 ? '' : 's'}** hidratan **${Math.round(hidratacion)} mL**, pero sumás ~**${cafeinaMg} mg** de cafeína y eso supera los **400 mg/día** recomendados. Bajá un par de tazas.`,
    },
    en: {
      mito: 'Myth: coffee dehydrates. Reality: it hydrates ~90%. Only a mild diuretic effect.',
      recomendacion: 'Coffee counts as hydration. In moderation (<400 mg caffeine/day).',
      insightTitle: 'Your coffee: does it hydrate?',
      insightOk: `Your **${c} cup${c === 1 ? '' : 's'}** add up to **${Math.round(hidratacion)} mL** of net hydration and ~**${cafeinaMg} mg** of caffeine, within the safe 400 mg/day limit. Coffee DOES count as fluid.`,
      insightWarn: `Your **${c} cup${c === 1 ? '' : 's'}** hydrate **${Math.round(hidratacion)} mL**, but you take in ~**${cafeinaMg} mg** of caffeine, above the recommended **400 mg/day**. Cut back a couple of cups.`,
    },
  } as const)[__lang];
  return {
    hidratacionNeta:`${Math.round(hidratacion)} mL (~${(hidratacion/1000).toFixed(1)} L)`,
    mito:T.mito,
    recomendacion:T.recomendacion,
    _insight: {
      title: T.insightTitle,
      text: sobreLimite ? T.insightWarn : T.insightOk,
      tone: sobreLimite ? 'warn' : 'good',
      icon: '☕',
    },
  };
}
