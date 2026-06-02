export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | object; }
export function tesisPalabrasTiempoNecesarioElaboracion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      semanas: (n: number) => `${n} semanas`,
      meses: (n: string) => `${n} meses`,
      recLargo: 'Muy largo. Aumenta ritmo o consulta con tu directora.',
      recRazonable: 'Razonable.',
      recBueno: 'Buen ritmo — mantenelo.',
      insTitle: 'Tu cronograma de tesis',
      insLargo: (sem: number, mes: string) => `A ${ps} palabras/semana tardarías **${sem} semanas** (${mes} meses): es un plazo muy largo. Subí el ritmo semanal o reajustá el alcance con tu directora.`,
      insRazonable: (sem: number, mes: string) => `Con ${ps} palabras/semana terminás en **${sem} semanas** (${mes} meses): un plazo razonable, sostené la constancia.`,
      insBueno: (sem: number, mes: string) => `A ${ps} palabras/semana la terminás en solo **${sem} semanas** (${mes} meses): muy buen ritmo, mantenelo.`,
      zCorto: 'Buen ritmo', zMedio: 'Razonable', zLargo: 'Muy largo',
      mkLabel: (sem: number) => `${sem} sem`,
      aria: (sem: number) => `Cronograma estimado de ${sem} semanas para terminar la tesis`,
    },
    en: {
      semanas: (n: number) => `${n} weeks`,
      meses: (n: string) => `${n} months`,
      recLargo: 'Too long. Increase your pace or consult with your advisor.',
      recRazonable: 'Reasonable.',
      recBueno: 'Good pace — keep it up.',
      insTitle: 'Your thesis timeline',
      insLargo: (sem: number, mes: string) => `At ${ps} words/week it would take **${sem} weeks** (${mes} months): that is a very long timeline. Raise your weekly pace or rescope with your advisor.`,
      insRazonable: (sem: number, mes: string) => `At ${ps} words/week you finish in **${sem} weeks** (${mes} months): a reasonable timeline, keep it steady.`,
      insBueno: (sem: number, mes: string) => `At ${ps} words/week you finish in just **${sem} weeks** (${mes} months): a great pace, keep it up.`,
      zCorto: 'Good pace', zMedio: 'Reasonable', zLargo: 'Too long',
      mkLabel: (sem: number) => `${sem} wk`,
      aria: (sem: number) => `Estimated timeline of ${sem} weeks to finish the thesis`,
    },
  } as const)[__lang];
  const p=Number(i.palabras)||0; const ps=Number(i.palabrasSemana)||1;
  const s=p/ps; const m=s/4.33;
  const semEnteras=Math.ceil(s);
  const rec=s>26?T.recLargo:s>12?T.recRazonable:T.recBueno;
  const insTone: 'good'|'warn'|'neutral' = s>26 ? 'warn' : s>12 ? 'neutral' : 'good';
  const insText = s>26 ? T.insLargo(semEnteras, m.toFixed(1)) : s>12 ? T.insRazonable(semEnteras, m.toFixed(1)) : T.insBueno(semEnteras, m.toFixed(1));
  return {
    semanas:T.semanas(semEnteras),
    meses:T.meses(m.toFixed(1)),
    recomendacion:rec,
    _insight: { title: T.insTitle, text: insText, tone: insTone, icon: '🎓' },
    _chart: {
      type: 'scale',
      marker: semEnteras,
      markerLabel: T.mkLabel(semEnteras),
      min: 0,
      segments: [
        { nombre: T.zCorto, max: 12, color: '#34d399', colorDark: '#10b981' },
        { nombre: T.zMedio, max: 26, color: '#fbbf24', colorDark: '#f59e0b' },
        { nombre: T.zLargo, max: Math.max(40, semEnteras + 4), color: '#f87171', colorDark: '#ef4444' },
      ],
      ariaLabel: T.aria(semEnteras),
    },
  };
}
