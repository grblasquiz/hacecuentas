export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function biodegradacionResiduoTiempo(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const tiempos: Record<string, { es: string; en: string; pt: string; clase: 'rapido' | 'medio' | 'lento' }> = {
    'papel':         { es: '2-5 meses',   en: '2-5 months',  pt: '2-5 meses',  clase: 'rapido' },
    'cascara-fruta': { es: '2-4 semanas', en: '2-4 weeks',   pt: '2-4 semanas', clase: 'rapido' },
    'algodon':       { es: '1-5 meses',   en: '1-5 months',  pt: '1-5 meses',  clase: 'rapido' },
    'vidrio':        { es: '~4000 años',  en: '~4000 years', pt: '~4000 anos', clase: 'lento' },
    'lata':          { es: '10-500 años', en: '10-500 years',pt: '10-500 anos', clase: 'lento' },
    'plastico':      { es: '450+ años',   en: '450+ years',  pt: '450+ anos',  clase: 'lento' },
    'tetra':         { es: '30-40 años',  en: '30-40 years', pt: '30-40 anos', clase: 'medio' },
    'pañal':         { es: '500+ años',   en: '500+ years',  pt: '500+ anos',  clase: 'lento' },
    'neumatico':     { es: '1000+ años',  en: '1000+ years', pt: '1000+ anos', clase: 'lento' },
  };
  const T = ({
    es: { unknown: 'Desconocido', suffix: 'para biodegradarse completamente.',
      insTitle: 'Qué tan rápido vuelve a la tierra',
      insRapido: `**{m}** tarda **{t}** en degradarse: es residuo de descomposición rápida, ideal para compost.`,
      insMedio: `**{m}** tarda **{t}** en degradarse: décadas en desaparecer, mejor reciclarlo que tirarlo.`,
      insLento: `**{m}** tarda **{t}** en degradarse: prácticamente no desaparece en una vida humana — reducir y reciclar es clave.` },
    en: { unknown: 'Unknown',     suffix: 'to fully biodegrade.',
      insTitle: 'How fast it returns to the earth',
      insRapido: `**{m}** takes **{t}** to break down: fast-decomposing waste, ideal for compost.`,
      insMedio: `**{m}** takes **{t}** to break down: decades to disappear — better to recycle it than trash it.`,
      insLento: `**{m}** takes **{t}** to break down: it barely disappears within a human lifetime — reducing and recycling is key.` },
    pt: { unknown: 'Desconhecido', suffix: 'para se biodegradar completamente.',
      insTitle: 'Quão rápido volta à terra',
      insRapido: `**{m}** leva **{t}** para se decompor: resíduo de decomposição rápida, ideal para compostagem.`,
      insMedio: `**{m}** leva **{t}** para se decompor: décadas para desaparecer — melhor reciclar do que descartar.`,
      insLento: `**{m}** leva **{t}** para se decompor: praticamente não desaparece numa vida humana — reduzir e reciclar é fundamental.` },
  } as const)[__lang];
  const m = String(i.material);
  const entry = tiempos[m];
  const t = entry ? entry[__lang] : T.unknown;
  const resumen = `${m}: ${t} ${T.suffix}`;
  const out: Outputs = { tiempoEstimado: t, resumen };
  if (entry) {
    const tpl = entry.clase === 'rapido' ? T.insRapido : entry.clase === 'medio' ? T.insMedio : T.insLento;
    out._insight = {
      title: T.insTitle,
      text: tpl.replace('{m}', m).replace('{t}', t),
      tone: entry.clase === 'rapido' ? 'good' : entry.clase === 'medio' ? 'neutral' : 'warn',
      icon: entry.clase === 'rapido' ? '🌱' : '♻️',
    };
  }
  return out;
}
