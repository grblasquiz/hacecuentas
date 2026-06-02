export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function luzSolarHorasPlanta(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const tipos: Record<string, string> = { full: '6-8 h', partial: '3-5 h', shade: '1-3 h' };
  const t = String(i.tipo);
  const resumen = __lang === 'en'
    ? `Plant ${t}: needs ${tipos[t]} of direct sunlight/day.`
    : `Planta ${t}: necesita ${tipos[t]} de sol directo/día.`;

  const horas = tipos[t] || '?';
  const labels: Record<string, { es: string; en: string }> = {
    full: { es: 'sol pleno', en: 'full sun' },
    partial: { es: 'media sombra', en: 'partial shade' },
    shade: { es: 'sombra', en: 'shade' },
  };
  const lbl = labels[t];
  let insight: any;
  if (!lbl) {
    insight = __lang === 'en'
      ? { title: 'Pick an exposure', text: 'Choose your plant type (full sun, partial shade or shade) to get the daily sunlight it needs.', tone: 'neutral', icon: '☀️' }
      : { title: 'Elegí la exposición', text: 'Seleccioná el tipo de planta (sol pleno, media sombra o sombra) para ver cuántas horas de sol diarias necesita.', tone: 'neutral', icon: '☀️' };
  } else if (t === 'shade') {
    insight = __lang === 'en'
      ? { title: 'Keep it out of harsh sun', text: `A **${lbl.en}** plant wants just **${horas}** of direct light a day — ideally soft morning sun. Midday sun will scorch the leaves, so an east-facing or filtered spot is safest.`, tone: 'warn', icon: '🌥️' }
      : { title: 'Cuidá el sol fuerte', text: `Una planta de **${lbl.es}** quiere apenas **${horas}** de luz directa al día, mejor el sol suave de la mañana. El sol del mediodía le quema las hojas: ubicala al este o con luz filtrada.`, tone: 'warn', icon: '🌥️' };
  } else {
    insight = __lang === 'en'
      ? { title: 'How much sun it needs', text: `A **${lbl.en}** plant needs about **${horas}** of direct sunlight per day. Place it where it gets that exposure and adjust watering — more sun means it dries out faster.`, tone: 'neutral', icon: '☀️' }
      : { title: 'Cuánto sol necesita', text: `Una planta de **${lbl.es}** necesita unas **${horas}** de sol directo por día. Ubicala donde reciba esa exposición y ajustá el riego: a más sol, se seca más rápido.`, tone: 'neutral', icon: '☀️' };
  }
  return { horas, resumen, _insight: insight };
}
