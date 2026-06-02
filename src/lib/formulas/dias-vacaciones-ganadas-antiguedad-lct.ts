export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function diasVacacionesGanadasAntiguedadLct(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      proporcional: 'proporcional primer año',
      hasta5: 'hasta 5 años',
      de5a10: '5-10 años',
      de10a20: '10-20 años',
      mas20: 'más de 20 años',
      diasCorridos: (d: number) => `${d} días corridos`,
      interpretacion: (anios: number, a: number, d: number, t: string) => `Con ${anios.toFixed(1)} años (${a} meses) de antigüedad: ${d} días (tramo: ${t}).`,
      insightTitle: 'Tus vacaciones por ley',
      insightProp: (a: number, d: number) => `Con menos de 6 meses te corresponden vacaciones **proporcionales**: ~**${d} día${d === 1 ? '' : 's'}** (1 cada 20 trabajados). El primer tramo completo (**14 días**) llega al cumplir el año.`,
      insightFull: (anios: number, d: number, t: string, faltan: number, prox: number) =>
        `Por **${anios.toFixed(1)} años** de antigüedad estás en el tramo **${t}**: te corresponden **${d} días corridos** (LCT Art. 150).` +
        (faltan > 0 ? ` Te faltan **${faltan.toFixed(1)} año${faltan < 1.05 && faltan >= 0.95 ? '' : 's'}** para saltar a **${prox} días**.` : ' Ya estás en el tramo máximo.'),
      scaleLabel: (d: number) => `${d} días`,
      segHasta5: 'Hasta 5 años',
      seg5a10: '5–10 años',
      seg10a20: '10–20 años',
      segMas20: '+20 años',
      aria: (d: number, t: string) => `Días de vacaciones por antigüedad: ${d} días corridos, tramo ${t}.`,
    },
    en: {
      proporcional: 'proportional first year',
      hasta5: 'up to 5 years',
      de5a10: '5-10 years',
      de10a20: '10-20 years',
      mas20: 'more than 20 years',
      diasCorridos: (d: number) => `${d} calendar days`,
      interpretacion: (anios: number, a: number, d: number, t: string) => `With ${anios.toFixed(1)} years (${a} months) of seniority: ${d} days (bracket: ${t}).`,
      insightTitle: 'Your statutory vacation',
      insightProp: (a: number, d: number) => `Under 6 months you get **proportional** leave: ~**${d} day${d === 1 ? '' : 's'}** (1 per 20 worked). The first full bracket (**14 days**) kicks in at the one-year mark.`,
      insightFull: (anios: number, d: number, t: string, faltan: number, prox: number) =>
        `With **${anios.toFixed(1)} years** of seniority you're in the **${t}** bracket: you get **${d} calendar days** (Argentine LCT Art. 150).` +
        (faltan > 0 ? ` You're **${faltan.toFixed(1)} year${faltan < 1.05 && faltan >= 0.95 ? '' : 's'}** away from jumping to **${prox} days**.` : " You're already at the top bracket."),
      scaleLabel: (d: number) => `${d} days`,
      segHasta5: 'Up to 5 yrs',
      seg5a10: '5–10 yrs',
      seg10a20: '10–20 yrs',
      segMas20: '+20 yrs',
      aria: (d: number, t: string) => `Vacation days by seniority: ${d} calendar days, ${t} bracket.`,
    },
  } as const)[__lang];
  const a=Number(i.antiguedadMeses)||0; const anios=a/12;
  let d=0, t='';
  if(anios<0.5){d=Math.floor(a);t=T.proporcional}
  else if(anios<=5){d=14;t=T.hasta5}
  else if(anios<=10){d=21;t=T.de5a10}
  else if(anios<=20){d=28;t=T.de10a20}
  else {d=35;t=T.mas20}

  // años hasta el próximo tramo y días del próximo tramo
  let faltan = 0, prox = d;
  if (anios <= 5) { faltan = 5 - anios; prox = 21; }
  else if (anios <= 10) { faltan = 10 - anios; prox = 28; }
  else if (anios <= 20) { faltan = 20 - anios; prox = 35; }
  else { faltan = 0; prox = 35; }

  const proporcionalCase = anios < 0.5;
  const _insight = {
    title: T.insightTitle,
    text: proporcionalCase ? T.insightProp(a, d) : T.insightFull(anios, d, t, faltan, prox),
    tone: 'neutral' as 'good' | 'warn' | 'neutral',
    icon: '🏖️',
  };

  const _chart = {
    type: 'scale',
    marker: Math.min(anios, 25),
    markerLabel: T.scaleLabel(d),
    min: 0,
    segments: [
      { nombre: T.segHasta5, max: 5, color: '#bae6fd', colorDark: '#0369a1' },
      { nombre: T.seg5a10, max: 10, color: '#7dd3fc', colorDark: '#0284c7' },
      { nombre: T.seg10a20, max: 20, color: '#38bdf8', colorDark: '#0ea5e9' },
      { nombre: T.segMas20, max: 25, color: '#0ea5e9', colorDark: '#0369a1' },
    ],
    ariaLabel: T.aria(d, t),
  };

  return { dias: T.diasCorridos(d), interpretacion: T.interpretacion(anios, a, d, t), _insight, _chart };
}
