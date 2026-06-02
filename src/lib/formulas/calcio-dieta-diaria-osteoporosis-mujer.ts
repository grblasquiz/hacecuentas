export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function calcioDietaDiariaOsteoporosisMujer(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const e=Number(i.edad)||0; const sx=String(i.sexo||'mujer'); const emb=String(i.embarazada||'no');
  let rda=1000;
  if(emb==='si') rda=1300;
  else if(e<19) rda=1300;
  else if(e>50&&sx==='mujer') rda=1200;
  else if(e>70) rda=1200;
  // Motivo del requerimiento elevado (>1000) para personalizar el insight
  const motivo = emb==='si'
    ? (__lang==='en' ? 'pregnancy/breastfeeding' : 'embarazo o lactancia')
    : e<19
      ? (__lang==='en' ? 'bone growth in adolescence' : 'el crecimiento óseo en la adolescencia')
      : (e>50||e>70)
        ? (__lang==='en' ? 'higher bone loss after menopause' : 'la mayor pérdida ósea tras la menopausia')
        : '';
  // Porciones de lácteo (~300 mg/taza) equivalentes al RDA
  const porciones = Math.ceil(rda/300);
  const T = ({
    es: {
      rdaLabel: `${rda} mg/día`,
      recomendacion: `Mujer ${e} años: ${rda} mg/día. 2-3 porciones lácteos + vegetales verdes cubren.`,
      fuentes: 'Lácteos (300 mg/taza), sardinas, brócoli, almendras, semillas chía.',
      insightTitle: rda>1000 ? 'Requerimiento elevado' : 'Requerimiento estándar',
      insightText: rda>1000
        ? `Tu meta es **${rda} mg/día**, por encima del estándar de 1000 mg por ${motivo}. Equivale a unas **${porciones} porciones** de lácteo (300 mg c/u) o su combinación con verdes y semillas.`
        : `Tu meta es **${rda} mg/día**, el valor estándar para adultos. Se cubre con unas **${porciones} porciones** de lácteo (300 mg c/u) o vegetales verdes equivalentes.`,
    },
    en: {
      rdaLabel: `${rda} mg/day`,
      recomendacion: `Woman aged ${e}: ${rda} mg/day. 2–3 servings of dairy + leafy greens will cover it.`,
      fuentes: 'Dairy (300 mg/cup), sardines, broccoli, almonds, chia seeds.',
      insightTitle: rda>1000 ? 'Elevated requirement' : 'Standard requirement',
      insightText: rda>1000
        ? `Your target is **${rda} mg/day**, above the 1000 mg standard due to ${motivo}. That equals about **${porciones} servings** of dairy (300 mg each) or a mix with greens and seeds.`
        : `Your target is **${rda} mg/day**, the standard adult value. It is covered by about **${porciones} servings** of dairy (300 mg each) or equivalent leafy greens.`,
    },
  } as const)[__lang];
  return {
    rda: T.rdaLabel,
    recomendacion: T.recomendacion,
    fuentes: T.fuentes,
    _insight: {
      title: T.insightTitle,
      text: T.insightText,
      tone: rda>1000 ? 'warn' : 'good',
      icon: '🦴',
    },
    _chart: {
      type: 'scale',
      marker: rda,
      markerLabel: T.rdaLabel,
      min: 900,
      segments: [
        { nombre: __lang==='en' ? 'Standard 1000' : 'Estándar 1000', max: 1000, color: '#86efac', colorDark: '#22c55e' },
        { nombre: __lang==='en' ? 'Post-menopause 1200' : 'Posmenopausia 1200', max: 1200, color: '#fde68a', colorDark: '#f59e0b' },
        { nombre: __lang==='en' ? 'Teens / pregnancy 1300' : 'Adolesc./embarazo 1300', max: 1350, color: '#fdba74', colorDark: '#ea580c' },
      ],
      ariaLabel: __lang==='en'
        ? `Daily calcium target of ${rda} mg shown on the recommended-intake scale.`
        : `Meta diaria de calcio de ${rda} mg ubicada en la escala de ingesta recomendada.`,
    },
  };
}
