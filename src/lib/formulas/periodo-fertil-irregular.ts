/** Período fértil con ciclos irregulares — Ogino adaptado */
export interface Inputs { cicloMasCorto: number; cicloMasLargo: number; fumIrreg: string; __lang?: string; }
export interface Outputs { ventanaFertil: string; inicioVentana: string; finVentana: string; recomendacion: string; _insight?: any; }

export function periodoFertilIrregular(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      fechaInvalida: 'Ingresá una fecha válida',
      cicloCortoRango: 'Ciclo más corto: entre 18 y 40 días',
      cicloLargoRango: 'Ciclo más largo: entre 24 y 50 días',
      cicloLargoMenor: 'El ciclo más largo debe ser mayor que el más corto',
      insightTitle: 'Tu ventana fértil estimada',
      insightWide: (amp: number) => `Tu ventana abarca **${amp} días**, más ancha que un ciclo regular porque tus ciclos varían bastante. Tomala como una guía amplia y confirmá la ovulación con tests de LH.`,
      insightNarrow: (amp: number) => `Tu ventana fértil es de **${amp} días**, un rango acotado. Aun así, un test de ovulación te ayuda a precisar el día exacto.`,
    },
    en: {
      fechaInvalida: 'Enter a valid date',
      cicloCortoRango: 'Shortest cycle: between 18 and 40 days',
      cicloLargoRango: 'Longest cycle: between 24 and 50 days',
      cicloLargoMenor: 'The longest cycle must be greater than the shortest',
      insightTitle: 'Your estimated fertile window',
      insightWide: (amp: number) => `Your window spans **${amp} days**, wider than a regular cycle because your cycles vary quite a bit. Treat it as a broad guide and confirm ovulation with LH tests.`,
      insightNarrow: (amp: number) => `Your fertile window is **${amp} days**, a fairly tight range. Even so, an ovulation test helps you pin down the exact day.`,
    },
  } as const)[__lang];

  const corto = Number(i.cicloMasCorto);
  const largo = Number(i.cicloMasLargo);
  const parts = String(i.fumIrreg || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) throw new Error(T.fechaInvalida);
  const [yy, mm, dd] = parts;
  const fum = new Date(yy, mm - 1, dd);
  if (isNaN(fum.getTime())) throw new Error(T.fechaInvalida);
  if (corto < 18 || corto > 40) throw new Error(T.cicloCortoRango);
  if (largo < 24 || largo > 50) throw new Error(T.cicloLargoRango);
  if (largo < corto) throw new Error(T.cicloLargoMenor);

  const diaInicio = corto - 18;
  const diaFin = largo - 11;

  const inicio = new Date(fum.getTime());
  inicio.setDate(inicio.getDate() + diaInicio);
  const fin = new Date(fum.getTime());
  fin.setDate(fin.getDate() + diaFin);

  const amplitud = diaFin - diaInicio + 1;
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  let rec = __lang === 'en'
    ? `Your fertile window spans ${amplitud} days (from day ${diaInicio + 1} to day ${diaFin + 1} of your cycle).`
    : `Tu ventana fértil abarca ${amplitud} días (del día ${diaInicio + 1} al ${diaFin + 1} del ciclo).`;
  if (amplitud > 14) {
    rec += __lang === 'en'
      ? ' This is a wide window because your cycles vary a lot. We recommend complementing with ovulation tests (LH) for greater accuracy.'
      : ' Es una ventana amplia porque tus ciclos varían mucho. Te recomendamos complementar con tests de ovulación (LH) para mayor precisión.';
  } else {
    rec += __lang === 'en'
      ? ' Complement with ovulation tests to confirm the exact day.'
      : ' Complementá con tests de ovulación para confirmar el día exacto.';
  }

  return {
    ventanaFertil: __lang === 'en'
      ? `Day ${diaInicio + 1} to day ${diaFin + 1} of the cycle (${amplitud} days)`
      : `Día ${diaInicio + 1} al día ${diaFin + 1} del ciclo (${amplitud} días)`,
    inicioVentana: fmt(inicio),
    finVentana: fmt(fin),
    recomendacion: rec,
    _insight: {
      title: T.insightTitle,
      text: amplitud > 14 ? T.insightWide(amplitud) : T.insightNarrow(amplitud),
      tone: amplitud > 14 ? 'warn' : 'good',
      icon: '🌸',
    },
  };
}
