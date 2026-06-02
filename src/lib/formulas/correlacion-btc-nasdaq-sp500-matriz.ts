export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function correlacionBtcNasdaqSp500Matriz(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      alta: 'Alta correlación: BTC se mueve con tech',
      media: 'Correlación media',
      baja: 'Baja correlación, diversifica bien',
      tAlta: 'Poca diversificación',
      tMedia: 'Diversificación parcial',
      tBaja: 'Buena diversificación',
      mesesTxt: (mm: number) => `${mm} meses`,
    },
    en: {
      alta: 'High correlation: BTC moves with tech',
      media: 'Medium correlation',
      baja: 'Low correlation, diversifies well',
      tAlta: 'Little diversification',
      tMedia: 'Partial diversification',
      tBaja: 'Good diversification',
      mesesTxt: (mm: number) => `${mm} months`,
    },
  } as const)[__lang];
  const m=Number(i.periodoMeses)||12;
  const cNas=m<=6?0.75:m<=12?0.65:m<=24?0.55:0.45;
  const cSp=cNas*0.85;
  const interp=cNas>0.6?T.alta:cNas>0.3?T.media:T.baja;
  const zona = cNas > 0.6 ? 'alta' : cNas > 0.3 ? 'media' : 'baja';
  const tone = zona === 'alta' ? 'warn' : zona === 'baja' ? 'good' : 'neutral';
  const _insight = __lang === 'en'
    ? {
        title: zona === 'alta' ? T.tAlta : zona === 'baja' ? T.tBaja : T.tMedia,
        text: `Over **${T.mesesTxt(m)}**, BTC's correlation with the Nasdaq is **${cNas.toFixed(2)}** and with the S&P 500 **${cSp.toFixed(2)}**. ${cNas > 0.6 ? 'It largely tracks tech stocks, so it adds little diversification to an equity portfolio.' : cNas > 0.3 ? 'It moves somewhat with stocks but keeps part of its own behavior.' : 'It largely decouples from stocks, so it diversifies an equity portfolio well.'}`,
        tone,
        icon: '₿',
      }
    : {
        title: zona === 'alta' ? T.tAlta : zona === 'baja' ? T.tBaja : T.tMedia,
        text: `En **${T.mesesTxt(m)}**, la correlación de BTC con el Nasdaq es **${cNas.toFixed(2)}** y con el S&P 500 **${cSp.toFixed(2)}**. ${cNas > 0.6 ? 'Se mueve casi como las tech, así que aporta poca diversificación a una cartera de acciones.' : cNas > 0.3 ? 'Acompaña en parte a las acciones pero conserva algo de comportamiento propio.' : 'Se desacopla bastante de las acciones, así que diversifica bien una cartera de equity.'}`,
        tone,
        icon: '₿',
      };
  const _chart = {
    type: 'scale',
    marker: cNas,
    markerLabel: cNas.toFixed(2),
    min: 0,
    segments: [
      { nombre: __lang === 'en' ? 'Low' : 'Baja', max: 0.3, color: '#22c55e', colorDark: '#16a34a' },
      { nombre: __lang === 'en' ? 'Medium' : 'Media', max: 0.6, color: '#f59e0b', colorDark: '#d97706' },
      { nombre: __lang === 'en' ? 'High' : 'Alta', max: 1, color: '#ef4444', colorDark: '#dc2626' },
    ],
    ariaLabel: __lang === 'en'
      ? `BTC vs Nasdaq correlation ${cNas.toFixed(2)} on a 0 to 1 scale; above 0.6 means it tracks tech closely.`
      : `Correlación BTC vs Nasdaq de ${cNas.toFixed(2)} en escala 0 a 1; por encima de 0,6 se mueve muy pegado a las tech.`,
  };
  return { correlacionNasdaq:cNas.toFixed(2), correlacionSp500:cSp.toFixed(2), interpretacion:interp, _insight, _chart };
}
