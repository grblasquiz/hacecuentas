export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function tesisPalabrasTiempoNecesarioElaboracion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      semanas: (n: number) => `${n} semanas`,
      meses: (n: string) => `${n} meses`,
      recLargo: 'Muy largo. Aumenta ritmo o consulta con tu directora.',
      recRazonable: 'Razonable.',
      recBueno: 'Buen ritmo — mantenelo.',
    },
    en: {
      semanas: (n: number) => `${n} weeks`,
      meses: (n: string) => `${n} months`,
      recLargo: 'Too long. Increase your pace or consult with your advisor.',
      recRazonable: 'Reasonable.',
      recBueno: 'Good pace — keep it up.',
    },
  } as const)[__lang];
  const p=Number(i.palabras)||0; const ps=Number(i.palabrasSemana)||1;
  const s=p/ps; const m=s/4.33;
  const rec=s>26?T.recLargo:s>12?T.recRazonable:T.recBueno;
  return { semanas:T.semanas(Math.ceil(s)), meses:T.meses(m.toFixed(1)), recomendacion:rec };
}
